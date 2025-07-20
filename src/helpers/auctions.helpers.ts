export class AuctionsHelper {
  static generateAuctionCode(auctionId: number, name: string, role: string): string {
    const nameInitial = name[Math.floor(Math.random() * name.length)].toUpperCase();
    const secondNameInitial = name[Math.floor(Math.random() * name.length)].toUpperCase();
    const roleInitial = role[Math.floor(Math.random() * role.length)].toUpperCase();
    return roleInitial + nameInitial + auctionId.toString() + secondNameInitial;
  }

  static getNotificationJSON(name: string, state?: string, code?: string): JSON {
    const result: { name?: string; state?: string; code?: string } = {};
    if (name) {
      result.name = name;
    }
    if (state) {
      result.state = state;
    }
    if (code) {
      result.code = code;
    }
    return result as unknown as JSON;
  }
}
