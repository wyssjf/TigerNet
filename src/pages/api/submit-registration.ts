const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const POST = async ({ request }) => {
  try {
    const data = await request.formData();

    // Helpers
    const str  = (key) => (data.get(key) ?? '').toString().trim() || null;
    const bool = (key) => str(key) === 'yes';
    const arr  = (key) => data.getAll(key).map(v => v.toString().trim()).filter(Boolean);

    // Build record
    const record = {
      athlete_type:        str('type'),
      season:              arr('season[]'),
      event_group:         str('eventGroup'),
      sprint_addons:       arr('sprintAddons[]'),
      first_name:          str('firstName'),
      last_name:           str('lastName'),
      grade:               parseInt(str('grade') ?? '0', 10) || null,
      birthday:            str('birthday'),
      phone:               str('phone'),
      email:               str('email'),
      middle_school:       str('middleSchool'),
      other_middle_school: str('otherMiddleSchool'),
      is_specialty:        bool('isSpecialty'),
      specialty_program:   str('specialtyProgram'),
      team:                str('team'),
      has_activities:      bool('hasActivities'),
      activities:          arr('activities[]'),
      parent1_name:        str('parent1Name'),
      parent1_phone:       str('parent1Phone'),
      parent1_email:       str('parent1Email'),
      parent2_name:        str('parent2Name'),
      parent2_phone:       str('parent2Phone'),
      parent2_email:       str('parent2Email'),
      notes:               str('notes'),
    };

    // Basic validation
    const required = [
      'athlete_type', 'first_name', 'last_name', 'grade', 'birthday',
      'phone', 'email', 'middle_school', 'team',
      'parent1_name', 'parent1_phone', 'parent1_email',
    ];

    for (const field of required) {
      if (!record[field]) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required field: ' + field }),
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

    // Raw REST insert — bypasses supabase-js client entirely
    const response = await fetch(supabaseUrl + '/rest/v1/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase REST error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: errorText }),
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
      JSON.stringify({ success: false, error: err.message ?? 'Something went wrong.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};