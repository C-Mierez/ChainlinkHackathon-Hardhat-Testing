import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const shouldDeposit = (): void => {
  context("#deposit", async function () {
    it("should revert if token is amount not greater than zero", async function () {
      const amount = ethers.constants.Zero;
      const tx = this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);
      await expect(tx).to.be.revertedWith("NeedsMoreThanZero");
    });

    it("should emit a Deposit event", async function () {
      const amount = ethers.constants.One;

      const tx = this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);
      await expect(tx)
        .to.emit(this.lending, "Deposit")
        .withArgs(
          this.signers.alice.address,
          this.mocks.mockUsdc.address,
          amount
        );
    });

    it("should update balance value properly", async function () {
      const initialBalance = await this.lending.s_accountToTokenDeposits(
        this.signers.alice.address,
        this.mocks.mockUsdc.address
      );
      const amount = parseEther("1");

      await this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);

      const currentBalance = await this.lending.s_accountToTokenDeposits(
        this.signers.alice.address,
        this.mocks.mockUsdc.address
      );

      expect(currentBalance).to.eq(initialBalance.add(amount));
    });

    it("should revert with TransferFailed error", async function () {
      await this.mocks.mockUsdc.mock.transferFrom.returns(false);

      const amount = parseEther("1");

      const tx = this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);
      await expect(tx).to.be.revertedWith("TransferFailed");
    });
  });
};
