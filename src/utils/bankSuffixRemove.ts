export default function removeBankSuffix(bankName: string) {
  const firstSpaceIndex = bankName.indexOf(" ");
  if (firstSpaceIndex !== -1) {
    return bankName.slice(0, firstSpaceIndex);
  }

  return bankName;
}
