
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovyvejunlrjrezlqfaqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eXZlanVubHJqcmV6bHFmYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODM3MDYsImV4cCI6MjA5MTA1OTcwNn0.Ve9ydwHIIzZwptnEwOz0YwnoIiUAjKkHOeCMramFwsA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('bd_horarios_funcionamento').select('user_id').limit(1)
  console.log('Error:', error)
}

test()
