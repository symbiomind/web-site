(function(){window.dashboardPages=window.dashboardPages||[];const e={authVerified:!1,pages:[],navItems:[],container:null,nav:null,content:null,dialogEl:null,SECTION_STATE_KEY:"dashboardSectionStates",getTabFromURL(){const e=new URLSearchParams(window.location.search);return e.get("tab")},updateURL(e){const t=new URL(window.location);t.searchParams.set("tab",e),window.history.pushState({},"",t)},getSectionStates(){try{const e=sessionStorage.getItem(this.SECTION_STATE_KEY);return e?JSON.parse(e):{}}catch{return{}}},saveSectionState(e,t){try{const n=this.getSectionStates();n[e]=t,sessionStorage.setItem(this.SECTION_STATE_KEY,JSON.stringify(n))}catch{}},findParentSection(e){for(const t of this.navItems)if(t.type==="section"&&t.children)for(const n of t.children)if(n.id===e)return t.id;return null},registerPage(e){this.navItems.push(e),e.type==="section"&&e.children?e.children.forEach(e=>{this.pages.push(e)}):this.pages.push(e),this.nav&&this.content&&(this.addNavItem(e),e.type==="section"&&e.children?e.children.forEach(e=>this.addContentPane(e)):this.addContentPane(e))},async init(e){if(this.container=document.querySelector(e),!this.container){console.error(`Dashboard container '${e}' not found.`);return}if(window.SymbioAuth){const e=await window.SymbioAuth.requireAuth();if(!e)return;this.authVerified=!0}else console.warn("SymbioAuth not available - ensure auth.js loads before dashboard");this.container.innerHTML=`
      <div class="dashboard-grid">
        <div id="dashboard-overlay" class="dashboard-overlay"></div>
        <nav id="dashboard-nav" class="dashboard-nav">
          <ul class="nav-menu"></ul>
        </nav>
        <main id="dashboard-content" class="dashboard-content"></main>
      </div>
    `,this.nav=this.container.querySelector(".nav-menu"),this.content=this.container.querySelector("#dashboard-content"),window.dashboardPages.forEach(e=>this.registerPage(e));const t=this.getTabFromURL();let n=this.pages.length>0?this.pages[0].id:null;if(t){const e=this.pages.some(e=>e.id===t);e&&(n=t)}n&&this.showPage(n),this.setupOverlay(),window.addEventListener("popstate",()=>{const e=this.getTabFromURL();if(e){const t=this.pages.some(t=>t.id===e);t&&this.showPage(e,!1)}})},setupOverlay(){const e=this.container.querySelector("#dashboard-overlay");e&&e.addEventListener("click",()=>{const e=document.querySelector("#dashboard");e&&(e.checked=!0)})},addNavItem(e){e.type==="section"?this.addSectionNavItem(e):this.addPageNavItem(e)},addPageNavItem(e,t=null){const n=document.createElement("li");n.innerHTML=`<a href="#" data-page-id="${e.id}">${e.title}</a>`;const s=t||this.nav;s.appendChild(n),n.querySelector("a").addEventListener("click",async t=>{if(t.preventDefault(),window.SymbioAuth){const e=await window.SymbioAuth.requireAuth();if(!e)return}this.showPage(e.id);const n=document.querySelector("#dashboard");n&&(n.checked=!0)})},addSectionNavItem(e){const t=document.createElement("li");t.className="nav-section";const s=this.getSectionStates(),i=s.hasOwnProperty(e.id)?s[e.id]:e.expanded!==!1,n=`section-toggle-${e.id}`;t.innerHTML=`
      <input type="checkbox" id="${n}" class="section-toggle" ${i?"checked":""}>
      <label for="${n}" class="section-label">${e.title}</label>
      <ul class="section-submenu"></ul>
    `,this.nav.appendChild(t);const a=t.querySelector(".section-submenu");e.children&&e.children.forEach(e=>{this.addPageNavItem(e,a)});const o=t.querySelector(`#${n}`);o.addEventListener("change",()=>{this.saveSectionState(e.id,o.checked)})},expandSection(e){const t=this.nav.querySelector(`#section-toggle-${e}`);t&&!t.checked&&(t.checked=!0,this.saveSectionState(e,!0))},addContentPane(e){const t=document.createElement("div");t.id=`pane-${e.id}`,t.className="content-pane",t.innerHTML=e.html,t.style.display="none",this.content.appendChild(t)},showPage(e,t=!0){this.content.querySelectorAll(".content-pane").forEach(e=>{e.style.display="none"});const n=this.content.querySelector(`#pane-${e}`);n&&(n.style.display="block"),this.nav.querySelectorAll("a").forEach(t=>{t.classList.toggle("is-active",t.dataset.pageId===e)});const s=this.findParentSection(e);s&&this.expandSection(s),t&&this.updateURL(e)},createDialog(){const e=document.createElement("div");e.id="symbio-dialog",e.className="symbio-dialog",e.innerHTML=`
      <div class="symbio-dialog-backdrop"></div>
      <div class="symbio-dialog-container">
        <div class="symbio-dialog-header">
          <h3 class="symbio-dialog-title"></h3>
          <button type="button" class="symbio-dialog-close" aria-label="Close">&times;</button>
        </div>
        <div class="symbio-dialog-content"></div>
        <div class="symbio-dialog-footer"></div>
      </div>
    `,document.body.appendChild(e),this.dialogEl=e,e.querySelector(".symbio-dialog-backdrop").addEventListener("click",()=>{this.hideDialog()}),e.querySelector(".symbio-dialog-close").addEventListener("click",()=>{this.hideDialog()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&this.dialogEl.classList.contains("is-open")&&this.hideDialog()})},showDialog(e={}){this.dialogEl||this.createDialog();const{title:n="",content:s="",buttons:o=[],onClose:i=null}=e;this.dialogOnClose=i,this.dialogEl.querySelector(".symbio-dialog-title").textContent=n,this.dialogEl.querySelector(".symbio-dialog-content").innerHTML=s;const t=this.dialogEl.querySelector(".symbio-dialog-footer");t.innerHTML="",o.forEach(e=>{const n=document.createElement("button");n.type="button",n.className=`btn ${e.class||""}`.trim(),n.textContent=e.text,e.action==="close"?n.addEventListener("click",()=>this.hideDialog()):typeof e.action=="function"&&n.addEventListener("click",()=>e.action()),t.appendChild(n)}),this.dialogEl.classList.add("is-open"),document.body.style.overflow="hidden",setTimeout(()=>{const e=this.dialogEl.querySelector("input, button:not(.symbio-dialog-close)");e&&e.focus()},100)},hideDialog(){if(!this.dialogEl)return;this.dialogEl.classList.remove("is-open"),document.body.style.overflow="",typeof this.dialogOnClose=="function"&&(this.dialogOnClose(),this.dialogOnClose=null)}};window.dashboardApp=e,document.addEventListener("DOMContentLoaded",()=>{e.init("#dashboard-container")})})(),function(){window.dashboardPages=window.dashboardPages||[];function n(e){return e?!e.endsWith("Z")&&!e.includes("+")&&!e.includes("-",10)?new Date(e+"Z"):new Date(e):null}function e(e){if(!e)return"Never";const s=n(e);if(!s||isNaN(s.getTime()))return"Unknown";const t=Math.floor((new Date-s)/1e3);if(t<60)return"Just now";if(t<3600){const e=Math.floor(t/60);return`${e} minute${e>1?"s":""} ago`}if(t<86400){const e=Math.floor(t/3600);return`${e} hour${e>1?"s":""} ago`}if(t<2592e3){const e=Math.floor(t/86400);return`${e} day${e>1?"s":""} ago`}if(t<31536e3){const e=Math.floor(t/2592e3);return`${e} month${e>1?"s":""} ago`}const o=Math.floor(t/31536e3);return`${o} year${o>1?"s":""} ago`}function s(e){if(!e)return"Unknown";const t=new Date(e);return t.toLocaleDateString("en-US",{month:"long",year:"numeric"})}function o(e){return e?e.charAt(0).toUpperCase()+e.slice(1):"Unknown"}function i(e){if(!e)return{device:"Unknown Device",browser:"Unknown",icon:"💻"};let t="Unknown",s="Unknown",n="💻";return/iPhone/i.test(e)?(t="iPhone",n="📱"):/iPad/i.test(e)?(t="iPad",n="📱"):/Android/i.test(e)?/Mobile/i.test(e)?(t="Android Phone",n="📱"):(t="Android Tablet",n="📱"):/Macintosh|Mac OS/i.test(e)?(t="Mac",n="💻"):/Windows/i.test(e)?(t="Windows",n="💻"):/Linux/i.test(e)?(t="Linux",n="🐧"):/CrOS/i.test(e)&&(t="Chromebook",n="💻"),/Edg\//i.test(e)?s="Edge":/OPR\//i.test(e)||/Opera/i.test(e)?s="Opera":/Chrome/i.test(e)&&!/Chromium/i.test(e)?s="Chrome":/Safari/i.test(e)&&!/Chrome/i.test(e)?s="Safari":/Firefox/i.test(e)?s="Firefox":/MSIE|Trident/i.test(e)&&(s="IE"),{device:t,browser:s,icon:n}}async function a(){const e=sessionStorage.getItem("accessToken");if(!e)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/me`,{method:"GET",headers:{Authorization:`Bearer ${e}`}});if(t.ok)return await t.json();if(t.status===401)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;throw new Error(`Failed to load profile: ${t.status}`)}catch(e){throw console.error("Profile load error:",e),e}}async function r(e,t){const n=sessionStorage.getItem("accessToken");if(!n)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;try{const s=await fetch(`${SymbioConfig.api_url}/api/auth/change-password`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({current_password:e,new_password:t})});if(s.ok)return await s.json();if(s.status===401){const e=await s.json();throw new Error(e.detail||"Current password is incorrect")}const o=await s.json();throw new Error(o.detail||"Failed to change password")}catch(e){throw e.message?e:(console.error("Change password error:",e),new Error("Failed to change password. Please try again."))}}async function c(){const e=sessionStorage.getItem("accessToken");if(!e)return null;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/sessions`,{method:"GET",headers:{Authorization:`Bearer ${e}`}});if(t.ok)return await t.json();if(t.status===401)return null;throw new Error(`Failed to load sessions: ${t.status}`)}catch(e){throw console.error("Sessions load error:",e),e}}async function l(){const e=sessionStorage.getItem("accessToken");if(!e)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/logout-all`,{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(t.ok)return await t.json();if(t.status===401)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;throw new Error(`Logout failed: ${t.status}`)}catch(e){throw console.error("Logout all error:",e),e}}function d(t){return!t||t.length===0?'<p class="session-empty">No active sessions found.</p>':t.map(t=>{const n=i(t.device_info),o=`${n.device} • ${n.browser}`,a=t.ip_address||"Unknown",r=e(t.created_at),s=t.last_refreshed_at?e(t.last_refreshed_at):null;return`
      <div class="session-item ${t.is_current?"session-current":""}">
        <div class="session-item-header">
          <span class="session-device">
            <span class="session-icon">${n.icon}</span>
            ${o}
          </span>
          ${t.is_current?'<span class="session-current-badge">Current</span>':""}
        </div>
        <div class="session-item-ip">${a}</div>
        <div class="session-item-times">
          <span class="session-time">Logged in ${r}</span>
          ${s?`<span class="session-separator">•</span><span class="session-active">Active ${s}</span>`:""}
        </div>
      </div>
    `}).join("")}function t(){const t=document.getElementById("pane-profile");if(!t)return;const p=t.querySelector("#profile-loading"),y=t.querySelector("#profile-content"),g=t.querySelector("#profile-error"),v=t.querySelector("#profile-error-message"),x=t.querySelector("#profile-email"),O=t.querySelector("#profile-tier"),j=t.querySelector("#profile-verified"),w=t.querySelector("#profile-member-since"),_=t.querySelector("#profile-last-login"),u=t.querySelector("#profile-session-badge"),b=t.querySelector("#profile-session-list"),n=t.querySelector("#logout-all-btn");p.style.display="block",y.style.display="none",g.style.display="none",Promise.all([a(),c()]).then(([n,i])=>{if(!n)return;const a=n.user,r=n.active_sessions,l=i?i.sessions:[],c=t.querySelector("#email");c&&(c.value=a.email),x.textContent=a.email,O.textContent=o(a.subscription_tier),a.email_verified?j.innerHTML='<span class="status-verified">✓ Verified</span>':j.innerHTML='<span class="status-unverified">⚠ Not Verified</span>',w.textContent=s(a.created_at),_.textContent=e(a.last_login),r===1?(u.className="session-badge session-badge-ok",u.textContent="1 device"):(u.className="session-badge session-badge-warning",u.textContent=`${r} devices`),b&&(b.innerHTML=d(l)),p.style.display="none",y.style.display="block"}).catch(e=>{p.style.display="none",v.textContent=e.message||"Failed to load profile",g.style.display="block"}),n&&!n.dataset.initialized&&(n.dataset.initialized="true",n.addEventListener("click",async function(e){e.preventDefault();const t=confirm(`This will log you out of all devices including this one.

Are you sure you want to continue?`);if(!t)return;n.disabled=!0,n.textContent="Logging out...";try{const e=await l();e&&(sessionStorage.removeItem("accessToken"),sessionStorage.removeItem("refreshToken"),sessionStorage.removeItem("username"),window.location.href="/dashboard/login/?message=logged-out")}catch(e){v.textContent=e.message||"Failed to log out of all devices",g.style.display="block",n.disabled=!1,n.textContent="Log Out All Devices"}}));const f=t.querySelector("#change-password-form"),i=t.querySelector("#password-error"),m=t.querySelector("#password-error-message"),h=t.querySelector("#change-password-btn");f&&!f.dataset.initialized&&(f.dataset.initialized="true",f.addEventListener("submit",async function(e){e.preventDefault(),i.style.display="none";const s=t.querySelector("#current-password").value,n=t.querySelector("#new-password").value,o=t.querySelector("#confirm-password").value;if(!s||!n||!o){m.textContent="All fields are required",i.style.display="block";return}if(n!==o){m.textContent="New passwords do not match",i.style.display="block";return}if(n.length<6){m.textContent="New password must be at least 6 characters",i.style.display="block";return}h.disabled=!0,h.textContent="Changing...",t.querySelector("#current-password").disabled=!0,t.querySelector("#new-password").disabled=!0,t.querySelector("#confirm-password").disabled=!0;try{const e=await r(s,n);e&&(sessionStorage.removeItem("accessToken"),sessionStorage.removeItem("refreshToken"),sessionStorage.removeItem("username"),window.location.href="/dashboard/login/?message=password-changed")}catch(e){m.textContent=e.message||"Failed to change password",i.style.display="block",h.disabled=!1,h.textContent="Change Password",t.querySelector("#current-password").disabled=!1,t.querySelector("#new-password").disabled=!1,t.querySelector("#confirm-password").disabled=!1}}))}window.dashboardPages.push({id:"profile",title:"User Profile",html:`
    <div class="page-header">
      <h2>User Profile</h2>
      <p>Manage your account settings and view session information.</p>
    </div>

    <!-- Loading State -->
    <div id="profile-loading" class="profile-loading">
      <p>Loading profile...</p>
    </div>

    <!-- Error Callout -->
    <div id="profile-error" class="callout error" style="display: none;">
      <p id="profile-error-message">An error occurred</p>
    </div>

    <!-- Profile Content -->
    <div id="profile-content" class="page-content" style="display: none;">
      
      <!-- User Info Card -->
      <div class="profile-card">
        <h3>Account Information</h3>
        <div class="profile-info">
          <div class="profile-row">
            <span class="profile-label">Email</span>
            <span class="profile-value" id="profile-email">—</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Subscription</span>
            <span class="profile-value">
              <span id="profile-tier">—</span>
              <span class="tier-preview-badge">Preview</span>
            </span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Email Status</span>
            <span class="profile-value" id="profile-verified">—</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Member Since</span>
            <span class="profile-value" id="profile-member-since">—</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Last Login</span>
            <span class="profile-value" id="profile-last-login">—</span>
          </div>
        </div>
      </div>

      <!-- Change Password Card -->
      <div class="profile-card">
        <h3>Change Password</h3>
        
        <!-- Password Change Error/Success Callouts -->
        <div id="password-error" class="callout error" style="display: none;">
          <p id="password-error-message">An error occurred</p>
        </div>
        
        <form id="change-password-form" class="password-form">
          <input type="email" id="email" name="email" autocomplete="username" style="display: none;">
          
          <div class="password-input-group">
            <label for="current-password">Current Password</label>
            <input type="password" id="current-password" name="current-password" placeholder="Enter current password" autocomplete="current-password" required>
          </div>
          <div class="password-input-group">
            <label for="new-password">New Password</label>
            <input type="password" id="new-password" name="new-password" placeholder="Enter new password" autocomplete="new-password" required>
          </div>
          <div class="password-input-group">
            <label for="confirm-password">Confirm New Password</label>
            <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm new password" autocomplete="new-password" required>
          </div>
          <button type="submit" id="change-password-btn" class="btn btn-primary">
            Change Password
          </button>
        </form>
      </div>

      <!-- Sessions Card -->
      <div class="profile-card">
        <div class="sessions-header">
          <h3>Active Sessions</h3>
          <span id="profile-session-badge" class="session-badge">—</span>
        </div>
        
        <div id="profile-session-list" class="session-list">
          <!-- Sessions will be rendered here -->
        </div>

        <div class="session-footer">
          <p class="session-hint">
            Don't recognize a session? Log out of all devices to secure your account.
          </p>
          <button id="logout-all-btn" class="btn btn-danger">
            Log Out All Devices
          </button>
        </div>
      </div>

    </div>
  `}),document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){const e=document.getElementById("pane-profile");if(!e)return;e.style.display!=="none"&&t();const n=new MutationObserver(function(n){n.forEach(function(n){n.attributeName==="style"&&e.style.display!=="none"&&t()})});n.observe(e,{attributes:!0})},100)})}(),function(){window.dashboardPages=window.dashboardPages||[],window.dashboardPages.push({id:"memory-mcp",title:"Memory MCP",type:"section",expanded:!0,children:[{id:"memory-mcp-namespaces",title:"Namespaces",html:`
          <div class="page-header">
            <h2>Namespaces</h2>
            <p>Separate memory storage areas for different AI assistants or projects.</p>
          </div>
          <div class="page-content">
            <div class="profile-card">
              <div class="card-header-row">
                <h3>Your Namespaces</h3>
                <button class="btn btn-primary btn-sm" id="add-namespace-btn">+ Add Namespace</button>
              </div>
              <div id="namespaces-list">
                <p class="loading-text">Loading namespaces...</p>
              </div>
            </div>
          </div>
        `},{id:"memory-mcp-roles",title:"Roles",html:`
          <div class="page-header">
            <h2>Second Demo Page</h2>
            <p>Another page within the same section.</p>
          </div>
          <div class="page-content">
            <p>All pages in a section share the same collapsible parent in the nav.</p>
            <button onclick="alert('Hello from the second demo page!')">Click Me</button>
          </div>
        `}]});async function e(){const t=document.getElementById("namespaces-list");if(!t)return;t.innerHTML='<p class="loading-text">Loading namespaces...</p>';try{const s=sessionStorage.getItem("accessToken"),e=await fetch(`${SymbioConfig.api_url}/api/memory-mcp/namespace/list`,{method:"GET",headers:{Authorization:`Bearer ${s}`}});if(!e.ok)throw new Error(`API returned ${e.status}`);const o=await e.json();n(t,o.namespaces)}catch(s){console.error("Failed to load namespaces:",s),t.innerHTML=`
        <p class="error-text">Failed to load namespaces. <a href="#" id="retry-load">Retry</a></p>
      `;const n=t.querySelector("#retry-load");n&&n.addEventListener("click",t=>{t.preventDefault(),e()})}}function n(e,n){if(!n||n.length===0){e.innerHTML=`
        <p class="empty-state">No namespaces yet. Create one to get started!</p>
      `;return}const s=n.map(e=>{const n=new Date(e.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),s=e.embedding_config_id?"Custom":"System Default";return`
        <div class="namespace-card" data-namespace-id="${e.id}">
          <div class="namespace-info">
            <h4 class="namespace-name">${t(e.friendly_name)}</h4>
            <div class="namespace-meta">
              <span class="meta-item">Created: ${n}</span>
              <span class="meta-item">Embeddings: ${s}</span>
            </div>
          </div>
          <div class="namespace-actions">
            <!-- Used to select created roles for this resource -->
            <button class="btn btn-sm btn-secondary" disabled title="Coming soon">Roles</button>
            <button class="btn btn-sm btn-secondary" disabled title="Coming soon">Settings</button>
            <button class="btn btn-sm btn-danger btn-delete-namespace" data-id="${e.id}" data-name="${t(e.friendly_name)}">Delete</button>
          </div>
        </div>
      `}).join("");e.innerHTML=s,e.querySelectorAll(".btn-delete-namespace").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.id,n=e.dataset.name;a(t,n)})})}function t(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function s(e){const n=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/memory-mcp/namespace/create`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({friendly_name:e})});if(!t.ok){const e=await t.json().catch(()=>({}));throw new Error(e.detail||`API returned ${t.status}`)}return await t.json()}async function o(e){const n=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/memory-mcp/namespace/delete`,{method:"DELETE",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({namespace_id:e})});if(!t.ok){const e=await t.json().catch(()=>({}));throw new Error(e.detail||`API returned ${t.status}`)}return await t.json()}function i(){window.dashboardApp.showDialog({title:"Create Namespace",content:`
        <p class="dialog-description">Create a new namespace for storing AI memories.</p>
        <div class="dialog-input-group">
          <label for="namespace-name">Namespace Name</label>
          <input type="text" id="namespace-name" placeholder="e.g., My AI Assistant" autocomplete="off" maxlength="40">
          <span class="input-hint">2-40 characters</span>
        </div>
        <div id="create-error" class="dialog-error" style="display: none;"></div>
      `,buttons:[{text:"Cancel",action:"close"},{text:"Create",class:"btn-primary",action:async function(){const o=document.getElementById("namespace-name"),t=document.getElementById("create-error"),i=o.value.trim();if(i.length<2){t.textContent="Name must be at least 2 characters",t.style.display="block",o.focus();return}const n=document.querySelector(".symbio-dialog-footer .btn-primary"),a=n.textContent;n.textContent="Creating...",n.disabled=!0,t.style.display="none";try{await s(i),window.dashboardApp.hideDialog(),e()}catch(e){t.textContent=e.message,t.style.display="block",n.textContent=a,n.disabled=!1}}}]}),setTimeout(()=>{const e=document.getElementById("namespace-name");e&&e.focus()},150)}function a(n,s){window.dashboardApp.showDialog({title:"Delete Namespace",content:`
        <p class="dialog-warning">⚠️ This will permanently delete the namespace "<strong>${t(s)}</strong>" and all associated roles and credentials.</p>
        <p class="dialog-warning-emphasis">This cannot be undone.</p>
        <div id="delete-error" class="dialog-error" style="display: none;"></div>
      `,buttons:[{text:"Cancel",action:"close"},{text:"Delete Namespace",class:"btn-danger",action:async function(){const s=document.getElementById("delete-error"),t=document.querySelector(".symbio-dialog-footer .btn-danger"),i=t.textContent;t.textContent="Deleting...",t.disabled=!0,s.style.display="none";try{await o(n),window.dashboardApp.hideDialog(),e()}catch(e){s.textContent=e.message,s.style.display="block",t.textContent=i,t.disabled=!1}}}]})}function r(){const n=document.getElementById("pane-memory-mcp-namespaces");if(!n)return;const t=n.querySelector("#add-namespace-btn");t&&!t.dataset.initialized&&(t.dataset.initialized="true",t.addEventListener("click",i)),e()}document.addEventListener("DOMContentLoaded",function(){setTimeout(r,100)})}()