const members = [], common = [], individual = [];
const $ = id => document.getElementById(id);

function renderMembers(){
  $('members').innerHTML = '';
  $('indMember').innerHTML = '';
  members.forEach(m=>{
    $('members').innerHTML += `<span class="user-pill">${m}</span>`;
    $('indMember').innerHTML += `<option value="${m}">${m}</option>`;
  });
}

function renderCommon(){
  $('commonList').innerHTML = common.map(c=>`${c.desc} — ₹${c.amt.toFixed(2)}`).join('<br>');
}
function renderInd(){
  $('indList').innerHTML = individual.map(c=>`${c.member}: ${c.desc} — ₹${c.amt.toFixed(2)}`).join('<br>');
}

$('addMemberBtn').onclick = ()=>{
  const name = $('memberName').value.trim();
  if(!name) return;
  if(members.includes(name)) return alert('Member exists');
  members.push(name); $('memberName').value=''; renderMembers();
}
$('addCommonBtn').onclick = ()=>{
  const desc = $('commonDesc').value.trim()||'Common';
  const amt = parseFloat($('commonAmt').value);
  if(isNaN(amt)||amt<=0) return;
  common.push({desc,amt}); $('commonDesc').value=''; $('commonAmt').value=''; renderCommon();
}
$('addIndBtn').onclick = ()=>{
  const member = $('indMember').value; if(!member) return;
  const desc = $('indDesc').value.trim()||'Item';
  const amt = parseFloat($('indAmt').value);
  if(isNaN(amt)||amt<=0) return;
  individual.push({member,desc,amt}); $('indDesc').value=''; $('indAmt').value=''; renderInd();
}

function calculateTotals(){
  const totals={}; members.forEach(m=>totals[m]=0);
  const commonTotal=common.reduce((s,c)=>s+c.amt,0);
  const perCommon=members.length?commonTotal/members.length:0;
  members.forEach(m=>totals[m]+=perCommon);
  individual.forEach(it=>{totals[it.member]+=it.amt;});
  return {totals,commonTotal,perCommon};
}

$('calcBtn').onclick=()=>{
  const collectorName=$('collectorName').value.trim();
  const collectorUpi=$('collectorUpi').value.trim();
  if(!collectorName||!collectorUpi) return alert('Enter collector details');
  const note=encodeURIComponent($('upiNote').value||'Bill Split');
  const {totals,commonTotal,perCommon}=calculateTotals();

  $('summary').innerHTML = `<strong>Common total:</strong> ₹${commonTotal.toFixed(2)} (₹${perCommon.toFixed(2)} each)<br>` +
    Object.entries(totals).map(([m,v])=>`${m}: ₹${v.toFixed(2)}`).join('<br>');

  $('qrs').innerHTML='<h3>UPI QR Codes</h3><div id="qrGrid" class="qr-grid"></div>';
  Object.entries(totals).forEach(([m,v])=>{
    const upi=`upi://pay?pa=${encodeURIComponent(collectorUpi)}&pn=${encodeURIComponent(collectorName)}&am=${v.toFixed(2)}&cu=INR&tn=${note}`;
    const box=document.createElement('div'); 
    box.className='qr';
    box.innerHTML=`<strong>${m}</strong>₹${v.toFixed(2)}<div id="qr-${m}"></div><a href="${upi}" target="_blank">Open</a>`;
    $('qrGrid').appendChild(box);
    new QRCode(`qr-${m}`,{text:upi,width:160,height:160});
  });
}
