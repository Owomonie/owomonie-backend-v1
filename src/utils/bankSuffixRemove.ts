export default function removeBankSuffix(bankName: string) {
  if (bankName.startsWith("The ")) {
    bankName = bankName.slice(4);
  }

  if (bankName.startsWith("Bank of ")) {
    bankName = bankName.slice(8);
  }

  const firstSpaceIndex = bankName.indexOf(" ");
  if (firstSpaceIndex !== -1) {
    return bankName.slice(0, firstSpaceIndex);
  }

  return bankName;
}
