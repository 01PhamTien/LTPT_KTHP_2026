// UI Utilities (global ethers assumed from CDN)
export function status(msg) {
  const el = document.getElementById('status-message');
  if (el) el.textContent = msg;
}

export function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

export function toggleButtons(connected) {
  const connectBtn = document.getElementById('connect-btn');
  if (connectBtn) connectBtn.classList.toggle('hidden', connected);

  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) disconnectBtn.classList.toggle('hidden', !connected);

  const actionButtons = document.getElementById('action-buttons');
  if (actionButtons) actionButtons.classList.toggle('hidden', !connected);
}

export function short(addr) {
  if (!addr) return 'Not connected';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function format(val) {
  return Number(ethers.utils.formatEther(val)).toFixed(4);
}

export async function waitTx(tx) {
  status('⏳ Waiting for confirmation...');
  const receipt = await tx.wait();
  if (receipt && receipt.hash) {
    status('Tx confirmed: ' + receipt.hash.slice(0, 10) + '...');
  } else {
    status('Tx confirmed (no hash)');
  }
}

