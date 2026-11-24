// Role helpers. MENTOR and ADMIN share the mentor portal for now.
export const isStaff = (user) => user?.role === 'MENTOR' || user?.role === 'ADMIN';
export const homeFor = (user) => (isStaff(user) ? '/mentor' : '/dashboard');
