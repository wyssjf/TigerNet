import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
 
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
 
    // ── Helpers ──────────────────────────────────────────────────────────────
    const str  = (key: string) => (data.get(key) as string | null)?.trim() || null;
    const bool = (key: string) => str(key) === 'yes';
    const arr  = (key: string) => data.getAll(key).map(v => (v as string).trim()).filter(Boolean);
 
    // ── Build record ─────────────────────────────────────────────────────────
    const record = {
      // Phase 1
      athlete_type:        str('type'),
      season:              arr('season[]'),
      event_group:         str('eventGroup')   || null,
      sprint_addons:       arr('sprintAddons[]'),
 
      // Phase 2
      first_name:          str('firstName'),
      last_name:           str('lastName'),
      grade:               parseInt(str('grade') ?? '0', 10) || null,
      birthday:            str('birthday'),
      phone:               str('phone'),
      email:               str('email'),
 
      // Phase 3
      middle_school:       str('middleSchool'),
      other_middle_school: str('otherMiddleSchool') || null,
      is_specialty:        bool('isSpecialty'),
      specialty_program:   str('specialtyProgram') || null,
 
      // Phase 4
      team:                str('team'),
      has_activities:      bool('hasActivities'),
      activities:          arr('activities[]'),
 
      // Phase 5
      parent1_name:        str('parent1Name'),
      parent1_phone:       str('parent1Phone'),
      parent1_email:       str('parent1Email'),
      parent2_name:        str('parent2Name')  || null,
      parent2_phone:       str('parent2Phone') || null,
      parent2_email:       str('parent2Email') || null,
 
      // Phase 6
      notes:               str('notes') || null,
    };
 
    // ── Basic server-side validation ─────────────────────────────────────────
    const required = [
      'athlete_type', 'first_name', 'last_name', 'grade', 'birthday',
      'phone', 'email', 'middle_school', 'team',
      'parent1_name', 'parent1_phone', 'parent1_email',
    ] as const;
 
    for (const field of required) {
      if (!record[field]) {
        return new Response(
          JSON.stringify({ success: false, error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
 
    if (!record.season || record.season.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please select at least one season.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
 
    // ── Insert into Supabase ──────────────────────────────────────────────────
    const { error } = await supabase
      .from('registrations')
      .insert([record]);
 
    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Registration could not be saved. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
 
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
 
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};