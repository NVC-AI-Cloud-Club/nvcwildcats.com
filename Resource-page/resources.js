const resources = [
  {title:'GitHub: Getting started',category:'git',level:'Beginner',icon:'GH',description:'Create an account, set up your profile, and learn repositories, commits, and collaboration.',video:'https://www.youtube.com/results?search_query=GitHub+for+Beginners+GitHub+official+playlist',videoLabel:'GitHub beginner series',docs:'https://docs.github.com/en/get-started',tags:'github account profile repository commits beginner'},
  {title:'Git fundamentals',category:'git',level:'Beginner',icon:'GIT',description:'Understand how Git tracks changes and learn the everyday workflow behind version control.',video:'https://www.youtube.com/results?search_query=Git+and+GitHub+for+beginners+freeCodeCamp+full+course',videoLabel:'Git & GitHub full course',docs:'https://git-scm.com/doc',tags:'git version control commits branches terminal'},
  {title:'GitHub Desktop for Beginners',category:'git',level:'Beginner',icon:'▣',description:'Get started with GitHub Desktop and learn how to manage repositories, commit changes, and sync your projects without relying on the command line.',video:'https://youtu.be/2SgI1kAczfk?si=bYyMLTtQFKgwhlpT',videoLabel:'Watch video 1',docs:'https://docs.github.com/en/desktop',tags:'github desktop beginners install clone commit push pull'},
  {title:'GitKraken for Beginners',category:'git',level:'Beginner',icon:'⑂',description:'Connect GitHub, work with branches, and understand the visual commit graph using GitKraken.',video:'https://youtu.be/LBlijN29gb8?si=OEa3G718mNzqU_l2',videoLabel:'Watch video 1',video2:'https://youtu.be/zd2Y5zumBWo?si=MrjwDnyBqTZ_443x',video2Label:'Watch video 2',docs:'https://help.gitkraken.com/',tags:'gitkraken git client beginners branches merge graph'},
  {title:'GitHub collaboration',category:'git',level:'Intermediate',icon:'PR',description:'Learn how teams use branches, issues, pull requests, code reviews, and project boards.',video:'https://www.youtube.com/results?search_query=GitHub+pull+requests+branches+collaboration+tutorial',videoLabel:'Branches & pull requests',docs:'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests',tags:'collaboration pull request branch issues code review'},
  {title:'Visual Studio Code',category:'development',level:'Beginner',icon:'VS',description:'Install VS Code, explore the editor, add extensions, and open your first project.',video:'https://www.youtube.com/results?search_query=Visual+Studio+Code+beginner+full+course+freeCodeCamp',videoLabel:'VS Code beginner course',docs:'https://code.visualstudio.com/docs',tags:'vscode visual studio code editor extensions setup'},
  {title:'HTML & CSS basics',category:'development',level:'Beginner',icon:'</>',description:'Learn the building blocks of a website: HTML for structure and CSS for styling.',video:'https://www.youtube.com/results?search_query=HTML+CSS+full+course+beginner+freeCodeCamp',videoLabel:'HTML & CSS full course',docs:'https://developer.mozilla.org/en-US/docs/Learn',tags:'html css website web development beginner'},
  {title:'JavaScript fundamentals',category:'development',level:'Beginner',icon:'JS',description:'Get started with variables, functions, events, and interactive websites.',video:'https://www.youtube.com/results?search_query=JavaScript+beginner+full+course+freeCodeCamp',videoLabel:'JavaScript beginner course',docs:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',tags:'javascript js programming functions web'},
  {title:'AWS Cloud fundamentals',category:'cloud',level:'Beginner',icon:'AWS',description:'Explore cloud concepts, core AWS services, and guided beginner training.',video:'https://www.youtube.com/results?search_query=AWS+Cloud+Practitioner+Essentials+AWS+Training+official',videoLabel:'AWS fundamentals training',docs:'https://skillbuilder.aws/',tags:'aws cloud computing cloud practitioner fundamentals'},
  {title:'Amazon S3 & static websites',category:'cloud',level:'Beginner',icon:'S3',description:'Learn object storage and how to host static website files in an S3 bucket.',video:'https://www.youtube.com/results?search_query=AWS+S3+static+website+hosting+beginner+tutorial',videoLabel:'S3 static website tutorial',docs:'https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html',tags:'aws s3 bucket storage static website hosting'},
  {title:'AWS Lambda & serverless',category:'cloud',level:'Intermediate',icon:'λ',description:'Understand serverless computing and how Lambda runs code in response to events.',video:'https://www.youtube.com/results?search_query=AWS+Lambda+beginner+hands+on+tutorial',videoLabel:'Lambda hands-on tutorial',docs:'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',tags:'aws lambda serverless functions api'},
  {title:'Python for beginners',category:'ai',level:'Beginner',icon:'Py',description:'Start programming with Python and practice fundamentals using small examples.',video:'https://www.youtube.com/results?search_query=Python+beginner+full+course+freeCodeCamp',videoLabel:'Python beginner full course',docs:'https://docs.python.org/3/tutorial/',tags:'python programming beginner variables loops'},
  {title:'APIs explained',category:'development',level:'Beginner',icon:'API',description:'Learn what APIs do, how applications communicate, and how to make a simple request.',video:'https://www.youtube.com/results?search_query=APIs+explained+for+beginners+freeCodeCamp',videoLabel:'APIs for beginners',docs:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction',tags:'api rest http request json development'},
  {title:'AI & generative AI basics',category:'ai',level:'Beginner',icon:'AI',description:'Explore foundational AI concepts, generative AI, and responsible use of AI tools.',video:'https://www.youtube.com/results?search_query=Generative+AI+explained+for+beginners+IBM+Technology',videoLabel:'Generative AI explained',docs:'https://www.ibm.com/think/topics/generative-ai',tags:'artificial intelligence generative ai machine learning'},
  {title:'Prompt engineering',category:'ai',level:'Intermediate',icon:'✳',description:'Practice writing clear prompts, adding context, and evaluating AI-generated responses.',video:'https://www.youtube.com/results?search_query=Prompt+engineering+for+beginners+OpenAI',videoLabel:'Prompt engineering basics',docs:'https://platform.openai.com/docs/guides/prompt-engineering',tags:'prompt engineering generative ai chatgpt'},
  {title:'AWS Cloud Resume Challenge',category:'challenge',level:'Intermediate',icon:'CV',description:'Build a cloud-hosted resume with HTTPS, DNS, JavaScript visitor counter, database, API, tests, Infrastructure as Code, source control, and CI/CD.',video:'https://www.youtube.com/watch?v=3boinmh0CXQ',videoLabel:'AWS challenge step-by-step',docs:'https://cloudresumechallenge.dev/docs/the-challenge/aws/',tags:'aws cloud resume challenge portfolio project s3 cloudfront lambda dynamodb api terraform ci cd'},
  {title:'Cloud Resume Challenge: Terraform & CI/CD',category:'challenge',level:'Advanced',icon:'IaC',description:'Extend the challenge by provisioning AWS resources with Terraform and automating deployments with GitHub Actions.',video:'https://www.youtube.com/watch?v=3IvIEZlhTv4',videoLabel:'Terraform + GitHub Actions series',docs:'https://cloudresumechallenge.dev/docs/resources/',tags:'cloud resume challenge terraform github actions infrastructure as code deployment'},
  {title:'Terraform: Infrastructure as Code',category:'devops',level:'Beginner',icon:'TF',description:'Learn how Terraform describes infrastructure, compares desired and actual state, and provisions cloud resources.',video:'https://www.youtube.com/watch?v=l5k1ai_GBDE',videoLabel:'Terraform explained in 15 minutes',docs:'https://developer.hashicorp.com/terraform/tutorials',tags:'terraform hashicorp infrastructure as code iac providers state aws'},
  {title:'Ansible: Configuration automation',category:'devops',level:'Beginner',icon:'AN',description:'Learn inventories, modules, YAML playbooks, and how Ansible automates repeatable server configuration.',video:'https://www.youtube.com/watch?v=1id6ERvfozo',videoLabel:'Ansible beginner tutorial',docs:'https://docs.ansible.com/ansible/latest/getting_started/index.html',tags:'ansible automation configuration management playbook yaml inventory'},
  {title:'Docker: Containers',category:'devops',level:'Beginner',icon:'DK',description:'Understand images and containers, run your first container, build a Dockerfile, and use Docker Compose.',video:'https://www.youtube.com/watch?v=3c-iBn73dDE',videoLabel:'Docker full beginner course',docs:'https://docs.docker.com/get-started/',tags:'docker container image dockerfile compose registry'},
  {title:'Kubernetes: Container orchestration',category:'devops',level:'Intermediate',icon:'K8s',description:'Learn clusters, nodes, pods, deployments, services, configuration, and how Kubernetes manages containerized apps.',video:'https://www.youtube.com/watch?v=s_o8dwzRlu4',videoLabel:'Kubernetes crash course',docs:'https://kubernetes.io/docs/tutorials/kubernetes-basics/',tags:'kubernetes k8s cluster node pod deployment service orchestration'},
];

const grid = document.getElementById('resourceGrid');
const search = document.getElementById('resourceSearch');
const filters = [...document.querySelectorAll('.filter-button')];
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
let activeFilter = 'all';
function cardTemplate(item) {
  const levelClass = item.level.toLowerCase();
  return `<article class="resource-card" data-category="${item.category}">
    <div class="card-top"><div class="resource-icon" aria-hidden="true">${item.icon}</div><span class="difficulty ${levelClass}">${item.level}</span></div>
    <h3>${item.title}</h3><p>${item.description}</p>
    <div class="resource-links">
      <a class="video-link" href="${item.video}" target="_blank" rel="noopener" aria-label="${item.videoLabel || 'Watch video'} for ${item.title}">▶ ${item.videoLabel || 'Watch video'} <span>↗</span></a>
      ${item.video2 ? `<a class="video-link" href="${item.video2}" target="_blank" rel="noopener" aria-label="${item.video2Label || 'Watch video 2'} for ${item.title}">▶ ${item.video2Label || 'Watch video 2'} <span>↗</span></a>` : ''}
      ${item.video3 ? `<a class="video-link" href="${item.video3}" target="_blank" rel="noopener" aria-label="${item.video3Label || 'Watch video 3'} for ${item.title}">▶ ${item.video3Label || 'Watch video 3'} <span>↗</span></a>` : ''}
      <a class="docs-link" href="${item.docs}" target="_blank" rel="noopener" aria-label="Official documentation for ${item.title}">Official docs <span>↗</span></a>
    </div></article>`;
}
function renderResources() {
  const term = search.value.trim().toLowerCase();
  const filtered = resources.filter(item => {
    const matchesCategory = activeFilter === 'all' || item.category === activeFilter;
    const searchable = `${item.title} ${item.description} ${item.tags} ${item.level}`.toLowerCase();
    return matchesCategory && (!term || searchable.includes(term));
  });
  grid.innerHTML = filtered.map(cardTemplate).join('');
  emptyState.hidden = filtered.length !== 0;
  resultsCount.textContent = `Showing ${filtered.length} of ${resources.length} resources`;
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filter => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
  renderResources();
}));
search.addEventListener('input', renderResources);
document.getElementById('clearSearch').addEventListener('click', () => {
  search.value = ''; activeFilter = 'all';
  filters.forEach(filter => { const selected = filter.dataset.filter === 'all'; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
  renderResources(); search.focus();
});
document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => {
  const target = link.dataset.filterLink; activeFilter = target;
  filters.forEach(filter => { const selected = filter.dataset.filter === target; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
  renderResources();
}));
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('primaryNav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));
document.getElementById('currentYear').textContent = new Date().getFullYear();
renderResources();
