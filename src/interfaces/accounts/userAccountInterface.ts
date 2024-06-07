export default interface userAccountInterface {
  accountId: string;
  profilePicture: string | null;
  emailAddress: string;
  fullName: string | null;
  roles: string | null;
  pointsBalance: number | null;
}
