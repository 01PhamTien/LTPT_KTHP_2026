import { dao, crowdsale, hasTokens, account } from './config.js';
import { status, setText, format, waitTx, short } from './utils.js';

async function loadTotalRaised() {
  try {
    const raised = await dao.totalRaised();
    console.log('Total raised:', raised.toString());
    setText('total-raised', format(raised) + ' ETH');
  } catch (e) {
    console.log(e);
  }
}

async function loadProjects() {
  try {
    const container = document.getElementById('projects-list');
    container.innerHTML = '';
    let html = '';

    for (let i = 0; i < 50; i++) {
      try {
        console.log('Loading project', i);
        const p = await dao.projects(i);
        const voted = account ? await dao.hasVoted(account, i) : false;
        const canVote = hasTokens && !voted;

        html += `
<div class="card p-6 rounded-xl">
  <h3 class="text-lg text-white font-bold">${p[0]}</h3>
  <p class="text-white/70 text-sm">${p[1]}</p>
  <p class="text-blue-400 mt-2">Votes: ${format(p[3])}</p>
  <p class="text-green-400">Funded: ${p[4]}</p>
  <div class="mt-3 flex gap-3">
    <button onclick="vote(${i})" class="btn ${canVote ? 'bg-blue-500' : 'bg-gray-500'} px-4 py-2 rounded text-white" ${canVote ? '' : 'disabled'}>
      ${voted ? 'Voted' : hasTokens ? 'Vote' : 'No Tokens'}
    </button>
    <button onclick="fund(${i})" class="btn ${p[4] ? 'bg-gray-500' : 'bg-green-500'} px-4 py-2 rounded text-white" ${p[4] ? 'disabled' : ''}>
      ${p[4] ? 'Funded' : 'Fund'}
    </button>
  </div>
</div>
`;
      } catch (e) {
        console.log('Error loading project', i, e);
        break;
      }
    }
    container.innerHTML = html;

    loadFundings();
  } catch (err) {
    console.log(err);
  }
}

async function loadFundings() {
  try {
    const container = document.getElementById('fundings-list');
    container.innerHTML = '';
    const count = await dao.fundingCount();
    console.log('Funding count:', count.toString());
    let html = '';
    for (let i = 0; i < Number(count); i++) {
      console.log('Loading funding', i);
      const f = await dao.fundings(i);
      html += `<div class="funding-record">Project ${f[0]} received ${format(f[1])} ETH at ${new Date(f[2] * 1000).toLocaleString()} by ${short(f[3])}</div>`;
    }
    container.innerHTML = html;
  } catch (e) {
    console.log(e);
  }
}

async function buyTokens() {
  try {
    status('Buying tokens...');
    const tx = await crowdsale.buyTokens({
      value: ethers.utils.parseEther('0.1')
    });
    await waitTx(tx);
    status('✅ Buy success');
    loadUser();
    loadProjects();
    status('✅ Updated');
  } catch (err) {
    status('❌ ' + err.message);
  }
}

async function createProject() {
  try {
    status('Creating project...');
    const name = prompt('Project name:');
    const description = prompt('Project description:');
    const recipient = prompt('Recipient address:');
    if (!name || !description || !recipient) {
      status('❌ Project creation cancelled');
      return;
    }
    if (!ethers.utils.isAddress(recipient)) {
      status('❌ Invalid recipient address');
      return;
    }
    const tx = await dao.createProject(name, description, recipient);
    await waitTx(tx);
    status('✅ Project created');
    loadUser();
    loadProjects();
    status('✅ Updated');
  } catch (err) {
    status('❌ ' + err.message);
  }
}

async function vote(id) {
  try {
    status('Voting...');
    const tx = await dao.vote(id);
    await waitTx(tx);
    status('✅ Vote success');
    loadUser();
    loadProjects();
    status('✅ Updated');
  } catch (err) {
    status('❌ ' + err.message);
  }
}

async function fund(id) {
  try {
    status('Funding project...');
    const tx = await dao.fundProject(id);
    await waitTx(tx);
    status('✅ Project funded');
    loadUser();
    loadProjects();
    status('✅ Updated');
  } catch (err) {
    status('❌ ' + err.message);
  }
}

export { loadProjects, loadTotalRaised, loadFundings, buyTokens, createProject, vote, fund };

