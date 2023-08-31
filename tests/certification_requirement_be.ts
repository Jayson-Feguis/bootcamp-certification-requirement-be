import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet, Provider, web3 } from "@coral-xyz/anchor";
import { CertificationRequirementBe } from "../target/types/certification_requirement_be";
import { expect } from "chai";
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

function authorFilter(authorBase58PublicKey: any) {
  return {
    memcmp: {
      offset: 8,
      bytes: authorBase58PublicKey,
    },
  };
}

describe("certification_requirement_be", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .CertificationRequirementBe as Program<CertificationRequirementBe>;

  const juan = anchor.web3.Keypair.generate();

  it("Should initialize user profile", async () => {
    // Add request airdrop here
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        juan.publicKey,
        web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    const [userProfilePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [utf8.encode("USER_PROFILE"), juan.publicKey.toBuffer()],
      program.programId
    );

    // Initialize user profile
    await program.methods
      .initializeUser()
      .accounts({
        user: juan.publicKey,
        userProfile: userProfilePDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([juan])
      .rpc();
  });

  it("Juan should add data to leaderboard", async () => {
    const game = "tile";
    const mode = "4x4";
    const point = 12;
    const time = 17;
    const guess = 14;

    const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [utf8.encode("USER_PROFILE"), juan.publicKey.toBuffer()],
      program.programId
    );

    const userProfile: any = await program.account.userProfile.fetch(
      userProfilePda
    );

    const [leaderboardAccountPda] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          utf8.encode("LEADERBOARD_ACCOUNT"),
          juan.publicKey.toBuffer(),
          Uint8Array.from([userProfile.gamesPlayed]),
        ],
        program.programId
      );

    await program.methods
      .addLeaderboard(game, mode, point, time, guess)
      .accounts({
        user: juan.publicKey,
        userProfile: userProfilePda,
        leaderboardAccount: leaderboardAccountPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([juan])
      .rpc();

    let leaderboardAccount: any = await program.account.leaderboardAccount.all([
      authorFilter(juan.publicKey.toString()),
    ]);

    leaderboardAccount = leaderboardAccount[0].account;

    expect(leaderboardAccount.user.toString()).equal(juan.publicKey.toString());
    expect(leaderboardAccount.game).equal(game);
    expect(leaderboardAccount.mode).equal(mode);
    expect(leaderboardAccount.point).equal(point);
    expect(leaderboardAccount.time).equal(time);
    expect(leaderboardAccount.guess).equal(guess);
  });
});
