import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task } = await req.json();
    
    if (!task) {
      throw new Error('Task data is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Create context-aware prompts based on task type
    const currentDate = new Date();
    const taskAge = Math.floor((currentDate.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    let systemPrompt = "";
    let userPrompt = "";

    if (task.isRecurring) {
      const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const reminderTime = task.reminderTime ? new Date(`1970-01-01T${task.reminderTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'not set';
      const completionTime = task.completionTime ? new Date(`1970-01-01T${task.completionTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'not set';
      
      systemPrompt = `You are an AI assistant helping users track recurring task progress. Be encouraging, specific, and actionable. Focus on building habits and maintaining consistency.`;
      
      userPrompt = `Analyze this recurring task:
      
Title: ${task.title}
Description: ${task.description}
Current Day: ${currentDay}
Scheduled Days: ${task.daysOfWeek ? task.daysOfWeek.map(d => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][d-1]).join(', ') : 'Daily'}
Reminder Time: ${reminderTime}
Completion Time: ${completionTime}
Task Age: ${taskAge} days

Provide two separate responses:
1. PROGRESS_MADE: A brief assessment of their consistency and current status (max 50 words)
2. PROGRESS_TO_GO: Encouraging next steps and timing guidance (max 50 words)

Format as JSON: {"progressMade": "...", "progressToGo": "..."}`;

    } else {
      const remaining = Math.max(0, task.durationDays - taskAge);
      const progressPercent = Math.min(100, Math.round((taskAge / task.durationDays) * 100));
      
      systemPrompt = `You are an AI assistant helping users track project progress. Be realistic about timelines, encouraging about effort, and specific about next steps.`;
      
      userPrompt = `Analyze this project task:
      
Title: ${task.title}
Description: ${task.description}
Duration: ${task.durationDays} days
Days Elapsed: ${taskAge}
Days Remaining: ${remaining}
Progress: ${progressPercent}%
Reminder Frequency: Every ${task.reminderFrequency} days

Provide two separate responses:
1. PROGRESS_MADE: Assessment of progress based on time elapsed and task complexity (max 50 words)
2. PROGRESS_TO_GO: Specific next steps and timeline recommendations (max 50 words)

Format as JSON: {"progressMade": "...", "progressToGo": "..."}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log('AI Response:', content);
    
    // Parse the JSON response
    let progressData;
    try {
      progressData = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      progressData = {
        progressMade: "Progress analysis in development. Keep up the great work!",
        progressToGo: "Continue with your current approach and stay focused on your goals."
      };
    }

    return new Response(JSON.stringify(progressData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-task-progress:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      progressMade: "Unable to analyze progress right now. Keep pushing forward!",
      progressToGo: "Try again later. Your effort is what matters most."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});