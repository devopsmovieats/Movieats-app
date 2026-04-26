
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovyvejunlrjrezlqfaqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eXZlanVubHJqcmV6bHFmYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODM3MDYsImV4cCI6MjA5MTA1OTcwNn0.Ve9ydwHIIzZwptnEwOz0YwnoIiUAjKkHOeCMramFwsA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('bd_horarios_funcionamento').select('*').limit(1)
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]))
  } else {
    // Attempt to insert with a dummy to see valid columns in error
    const { error: err2 } = await supabase.from('bd_horarios_funcionamento').insert([{ test: 1 }])
    console.log('Error Message (check columns):', err2?.message)
  }
}

test()
