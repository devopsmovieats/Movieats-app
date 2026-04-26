
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovyvejunlrjrezlqfaqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eXZlanVubHJqcmV6bHFmYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODM3MDYsImV4cCI6MjA5MTA1OTcwNn0.Ve9ydwHIIzZwptnEwOz0YwnoIiUAjKkHOeCMramFwsA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'bd_config_estabelecimento' })
  // If RPC not available, try a select * on a non-existent row and check the error or result
  const { data: data2, error: error2 } = await supabase.from('bd_config_estabelecimento').select('*').limit(0)
  console.log('Columns:', data2)
}

test()
