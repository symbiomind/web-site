(function(){window.dashboardPages=window.dashboardPages||[];const e={pages:[],container:null,nav:null,content:null,getTabFromURL(){const e=new URLSearchParams(window.location.search);return e.get("tab")},updateURL(e){const t=new URL(window.location);t.searchParams.set("tab",e),window.history.pushState({},"",t)},registerPage(e){this.pages.push(e),this.nav&&this.content&&(this.addNavItem(e),this.addContentPane(e))},init(e){if(this.container=document.querySelector(e),!this.container){console.error(`Dashboard container '${e}' not found.`);return}this.container.innerHTML=`
      <div class="dashboard-grid">
        <div id="dashboard-overlay" class="dashboard-overlay"></div>
        <nav id="dashboard-nav" class="dashboard-nav">
          <ul class="nav-menu"></ul>
        </nav>
        <main id="dashboard-content" class="dashboard-content"></main>
      </div>
    `,this.nav=this.container.querySelector(".nav-menu"),this.content=this.container.querySelector("#dashboard-content"),window.dashboardPages.forEach(e=>this.registerPage(e));const t=this.getTabFromURL();let n=this.pages.length>0?this.pages[0].id:null;if(t){const e=this.pages.some(e=>e.id===t);e&&(n=t)}n&&this.showPage(n),this.setupOverlay(),window.addEventListener("popstate",()=>{const e=this.getTabFromURL();if(e){const t=this.pages.some(t=>t.id===e);t&&this.showPage(e,!1)}})},setupOverlay(){const e=this.container.querySelector("#dashboard-overlay");e&&e.addEventListener("click",()=>{const e=document.querySelector("#dashboard");e&&(e.checked=!0)})},addNavItem(e){const t=document.createElement("li");t.innerHTML=`<a href="#" data-page-id="${e.id}">${e.title}</a>`,this.nav.appendChild(t),t.querySelector("a").addEventListener("click",t=>{t.preventDefault(),this.showPage(e.id);const n=document.querySelector("#dashboard");n&&(n.checked=!0)})},addContentPane(e){const t=document.createElement("div");t.id=`pane-${e.id}`,t.className="content-pane",t.innerHTML=e.html,t.style.display="none",this.content.appendChild(t)},showPage(e,t=!0){this.content.querySelectorAll(".content-pane").forEach(e=>{e.style.display="none"});const n=this.content.querySelector(`#pane-${e}`);n&&(n.style.display="block"),this.nav.querySelectorAll("a").forEach(t=>{t.classList.toggle("is-active",t.dataset.pageId===e)}),t&&this.updateURL(e)}};document.addEventListener("DOMContentLoaded",()=>{e.init("#dashboard-container")})})(),function(){window.dashboardPages=window.dashboardPages||[],window.dashboardPages.push({id:"profile",title:"User Profile",html:`
    <div class="page-header">
      <h2>User Profile</h2>
      <p>This is a demonstration of a user profile page.</p>
    </div>
    <div class="page-content">
      <p><strong>Name:</strong> Jane Doe</p>
      <p><strong>Email:</strong> jane.doe@example.com</p>
      <p><strong>Member Since:</strong> 2023</p>
    </div>
  `})}(),function(){window.dashboardPages=window.dashboardPages||[],window.dashboardPages.push({id:"demo",title:"Demo Page",html:`
    <div class="page-header">
      <h2>Demo Page</h2>
      <p>This is another example page to show the modular system.</p>
    </div>
    <div class="page-content">
      <p>Each page is loaded from its own JavaScript file, making the dashboard easy to extend.</p>
      <button onclick="alert('Hello from the demo page!')">Click Me</button>
    </div>
  `})}()