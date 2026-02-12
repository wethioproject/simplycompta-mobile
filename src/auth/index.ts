export const login = async (email: string, password: string) => {
  // Simulate login with email and password
  console.log('Logging in with', email, password);
  return { token: 'fake-token' };
};

export const logout = () => {
  // Implement logout logic
};