import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const accts = [
  { email: 'admin@askatutorlive.com', password: 'Admin@AskATutor2026!', full_name: 'Platform Admin', role: 'admin' },
  { email: 'help@askatutorlive.com',  password: 'Help@AskATutor2026!',  full_name: 'Help Desk',       role: 'admin' },
];
for (const a of accts) {
  let userId;
  const { data: created, error } = await sb.auth.admin.createUser({
    email: a.email, password: a.password, email_confirm: true,
    user_metadata: { full_name: a.full_name, account_type: 'student' },
  });
  if (error && !/already/i.test(error.message)) { console.error(a.email, error.message); continue; }
  if (created?.user) userId = created.user.id;
  else {
    const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list.users.find(u => u.email === a.email)?.id;
    // update password
    if (userId) await sb.auth.admin.updateUserById(userId, { password: a.password, email_confirm: true });
  }
  if (!userId) { console.error('no id', a.email); continue; }
  await sb.from('user_roles').upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
  console.log('OK', a.email, userId);
}
