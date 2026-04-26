
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovyvejunlrjrezlqfaqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eXZlanVubHJqcmV6bHFmYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODM3MDYsImV4cCI6MjA5MTA1OTcwNn0.Ve9ydwHIIzZwptnEwOz0YwnoIiUAjKkHOeCMramFwsA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  // Test user_id
  const { error: err1 } = await supabase.from('bd_horarios_funcionamento').select('user_id').limit(1)
  console.log('user_id exists?', !err1)
  
  // Test abertura
  const { error: err2 } = await supabase.from('bd_horarios_funcionamento').select('abertura').limit(1)
  console.log('abertura exists?', !err2)

  // Test esta_aberto
  const { error: err3 } = await supabase.from('bd_horarios_funcionamento').select('esta_aberto').limit(1)
  console.log('esta_aberto exists?', !err3)
}

test()
