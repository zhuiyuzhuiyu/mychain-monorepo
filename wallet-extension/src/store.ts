export interface WalletData { address: string; mnemonic: string; }

export async function getWallet(): Promise<WalletData | null> {
  return new Promise(resolve => {
    chrome.storage.local.get(['address', 'mnemonic'], res => {
      if (res.address && res.mnemonic) resolve({ address: res.address, mnemonic: res.mnemonic });
      else resolve(null);
    });
  });
}

export async function saveWallet(data: WalletData): Promise<void> {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

export async function clearWallet(): Promise<void> {
  return new Promise(resolve => chrome.storage.local.remove(['address', 'mnemonic'], resolve));
}
