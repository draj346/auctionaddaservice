export class AuctionsHelper {
    static generateAuctionCode(playerId: number, name: string, role: string ): string {
    const rand1 = Math.floor(Math.random() * 7) + 3;
    const rand2 = Math.floor(Math.random() * 7) + 3;
    const multiplier = rand1 * 10 + rand2;

    const product = playerId * multiplier;
    
    const nameInitial = name.charAt(0).toUpperCase();
    const roleInitial = role.charAt(0).toUpperCase();

    return nameInitial + product.toString() + roleInitial;
}
}