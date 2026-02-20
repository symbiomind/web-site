(function(){window.dashboardPages=window.dashboardPages||[];const e={authVerified:!1,currentUser:null,pages:[],navItems:[],pageCallbacks:{},currentPageId:null,container:null,nav:null,content:null,dialogEl:null,SECTION_STATE_KEY:"dashboardSectionStates",getTabFromURL(){const e=new URLSearchParams(window.location.search);return e.get("tab")},updateURL(e){const t=new URL(window.location);t.searchParams.set("tab",e),window.history.pushState({},"",t)},getUrlParams(){return Object.fromEntries(new URLSearchParams(window.location.search))},getUrlParam(e){return new URLSearchParams(window.location.search).get(e)},buildUrl(e,t={}){const n=new URL(e,window.location.origin);return Object.entries(t).forEach(([e,t])=>{t!=null&&n.searchParams.set(e,t)}),n.toString()},getSectionStates(){try{const e=sessionStorage.getItem(this.SECTION_STATE_KEY);return e?JSON.parse(e):{}}catch{return{}}},saveSectionState(e,t){try{const n=this.getSectionStates();n[e]=t,sessionStorage.setItem(this.SECTION_STATE_KEY,JSON.stringify(n))}catch{}},async loadCurrentUser(){const e=sessionStorage.getItem("accessToken");if(!e)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/me`,{method:"GET",headers:{Authorization:`Bearer ${e}`}});return t.ok?await t.json():t.status===401?(window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null):(console.error("Failed to load user data:",t.status),null)}catch(e){return console.error("User data load error:",e),null}},findParentSection(e){for(const t of this.navItems)if(t.type==="section"&&t.children)for(const n of t.children)if(n.id===e)return t.id;return null},registerPage(e){this.navItems.push(e),e.type==="section"&&e.children?e.children.forEach(e=>{this.pages.push(e)}):this.pages.push(e),this.nav&&this.content&&(this.addNavItem(e),e.type==="section"&&e.children?e.children.forEach(e=>this.addContentPane(e)):this.addContentPane(e))},async init(e){if(this.container=document.querySelector(e),!this.container){console.error(`Dashboard container '${e}' not found.`);return}if(window.SymbioAuth){const e=await window.SymbioAuth.requireAuth();if(!e)return;this.authVerified=!0}else console.warn("SymbioAuth not available - ensure auth.js loads before dashboard");const t=await this.loadCurrentUser();if(!t)return;this.currentUser=t.user,this.currentUserData=t,this.container.innerHTML=`
      <div class="dashboard-grid">
        <div id="dashboard-overlay" class="dashboard-overlay"></div>
        <nav id="dashboard-nav" class="dashboard-nav">
          <ul class="nav-menu"></ul>
        </nav>
        <main id="dashboard-content" class="dashboard-content"></main>
      </div>
    `,this.nav=this.container.querySelector(".nav-menu"),this.content=this.container.querySelector("#dashboard-content");let o=!1;window.dashboardPages.forEach(e=>{if(e.requiresSuperuser&&!this.currentUser.is_superuser)return;e.requiresSuperuser&&!o&&(this.addAdminHeader(),o=!0),this.registerPage(e)});const n=this.getTabFromURL();let s=this.pages.length>0?this.pages[0].id:null;if(n){const e=this.pages.some(e=>e.id===n);e&&(s=n)}s&&this.showPage(s),this.setupOverlay(),window.dispatchEvent(new CustomEvent("dashboardReady")),window.addEventListener("popstate",()=>{const e=this.getTabFromURL();if(e){const t=this.pages.some(t=>t.id===e);t&&this.showPage(e,!1)}})},setupOverlay(){const e=this.container.querySelector("#dashboard-overlay");e&&e.addEventListener("click",()=>{const e=document.querySelector("#dashboard");e&&(e.checked=!0)})},addNavItem(e){e.type==="section"?this.addSectionNavItem(e):this.addPageNavItem(e)},addPageNavItem(e,t=null){const n=document.createElement("li");n.innerHTML=`<a href="#" data-page-id="${e.id}">${e.title}</a>`;const s=t||this.nav;s.appendChild(n),n.querySelector("a").addEventListener("click",async t=>{if(t.preventDefault(),window.SymbioAuth){const e=await window.SymbioAuth.requireAuth();if(!e)return}this.showPage(e.id);const n=document.querySelector("#dashboard");n&&(n.checked=!0)})},addSectionNavItem(e){const t=document.createElement("li");t.className="nav-section";const s=this.getSectionStates(),i=s.hasOwnProperty(e.id)?s[e.id]:e.expanded!==!1,n=`section-toggle-${e.id}`;t.innerHTML=`
      <input type="checkbox" id="${n}" class="section-toggle" ${i?"checked":""}>
      <label for="${n}" class="section-label">${e.title}</label>
      <ul class="section-submenu"></ul>
    `,this.nav.appendChild(t);const a=t.querySelector(".section-submenu");e.children&&e.children.forEach(e=>{this.addPageNavItem(e,a)});const o=t.querySelector(`#${n}`);o.addEventListener("change",()=>{this.saveSectionState(e.id,o.checked)})},expandSection(e){const t=this.nav.querySelector(`#section-toggle-${e}`);t&&!t.checked&&(t.checked=!0,this.saveSectionState(e,!0))},addAdminHeader(){const e=document.createElement("h3");e.textContent="Administration",this.nav.appendChild(e)},onPageVisible(e,t){this.pageCallbacks[e]||(this.pageCallbacks[e]=[]),this.pageCallbacks[e].push(t),this.currentPageId===e&&t()},firePageCallbacks(e){const t=this.pageCallbacks[e];t&&t.length>0&&t.forEach(e=>e())},addContentPane(e){const t=document.createElement("div");t.id=`pane-${e.id}`,t.className="content-pane",t.innerHTML=e.html,t.style.display="none",this.content.appendChild(t)},showPage(e,t=!0){this.content.querySelectorAll(".content-pane").forEach(e=>{e.style.display="none"});const n=this.content.querySelector(`#pane-${e}`);n&&(n.style.display="block"),this.nav.querySelectorAll("a").forEach(t=>{t.classList.toggle("is-active",t.dataset.pageId===e)});const s=this.findParentSection(e);s&&this.expandSection(s),t&&this.updateURL(e),this.currentPageId=e,this.firePageCallbacks(e)},createDialog(){const e=document.createElement("div");e.id="symbio-dialog",e.className="symbio-dialog",e.innerHTML=`
      <div class="symbio-dialog-backdrop"></div>
      <div class="symbio-dialog-container">
        <div class="symbio-dialog-header">
          <h3 class="symbio-dialog-title"></h3>
          <button type="button" class="symbio-dialog-close" aria-label="Close">&times;</button>
        </div>
        <div class="symbio-dialog-content"></div>
        <div class="symbio-dialog-footer"></div>
      </div>
    `,document.body.appendChild(e),this.dialogEl=e,e.querySelector(".symbio-dialog-backdrop").addEventListener("click",()=>{this.hideDialog()}),e.querySelector(".symbio-dialog-close").addEventListener("click",()=>{this.hideDialog()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&this.dialogEl.classList.contains("is-open")&&this.hideDialog()})},showDialog(e={}){this.dialogEl||this.createDialog();const{title:n="",content:s="",buttons:o=[],onClose:i=null}=e;this.dialogOnClose=i,this.dialogEl.querySelector(".symbio-dialog-title").textContent=n,this.dialogEl.querySelector(".symbio-dialog-content").innerHTML=s;const t=this.dialogEl.querySelector(".symbio-dialog-footer");t.innerHTML="",o.forEach(e=>{const n=document.createElement("button");n.type="button",n.className=`btn ${e.class||""}`.trim(),n.textContent=e.text,e.action==="close"?n.addEventListener("click",()=>this.hideDialog()):typeof e.action=="function"&&n.addEventListener("click",()=>e.action()),t.appendChild(n)}),this.dialogEl.classList.add("is-open"),document.body.style.overflow="hidden",setTimeout(()=>{const e=this.dialogEl.querySelector("input, button:not(.symbio-dialog-close)");e&&e.focus()},100)},hideDialog(){if(!this.dialogEl)return;this.dialogEl.classList.remove("is-open"),document.body.style.overflow="",typeof this.dialogOnClose=="function"&&(this.dialogOnClose(),this.dialogOnClose=null)}};window.dashboardApp=e,document.addEventListener("DOMContentLoaded",()=>{e.init("#dashboard-container")})})(),function(){window.dashboardPages=window.dashboardPages||[];function t(e){return e?!e.endsWith("Z")&&!e.includes("+")&&!e.includes("-",10)?new Date(e+"Z"):new Date(e):null}function e(e){if(!e)return"Never";const s=t(e);if(!s||isNaN(s.getTime()))return"Unknown";const n=Math.floor((new Date-s)/1e3);if(n<60)return"Just now";if(n<3600){const e=Math.floor(n/60);return`${e} minute${e>1?"s":""} ago`}if(n<86400){const e=Math.floor(n/3600);return`${e} hour${e>1?"s":""} ago`}if(n<2592e3){const e=Math.floor(n/86400);return`${e} day${e>1?"s":""} ago`}if(n<31536e3){const e=Math.floor(n/2592e3);return`${e} month${e>1?"s":""} ago`}const o=Math.floor(n/31536e3);return`${o} year${o>1?"s":""} ago`}function n(e){if(!e)return"Unknown";const t=new Date(e);return t.toLocaleDateString("en-US",{month:"long",year:"numeric"})}function s(e){return e?e.charAt(0).toUpperCase()+e.slice(1):"Unknown"}function o(e){if(!e)return{device:"Unknown Device",browser:"Unknown",icon:"💻"};let t="Unknown",s="Unknown",n="💻";return/iPhone/i.test(e)?(t="iPhone",n="📱"):/iPad/i.test(e)?(t="iPad",n="📱"):/Android/i.test(e)?/Mobile/i.test(e)?(t="Android Phone",n="📱"):(t="Android Tablet",n="📱"):/Macintosh|Mac OS/i.test(e)?(t="Mac",n="💻"):/Windows/i.test(e)?(t="Windows",n="💻"):/Linux/i.test(e)?(t="Linux",n="🐧"):/CrOS/i.test(e)&&(t="Chromebook",n="💻"),/Edg\//i.test(e)?s="Edge":/OPR\//i.test(e)||/Opera/i.test(e)?s="Opera":/Chrome/i.test(e)&&!/Chromium/i.test(e)?s="Chrome":/Safari/i.test(e)&&!/Chrome/i.test(e)?s="Safari":/Firefox/i.test(e)?s="Firefox":/MSIE|Trident/i.test(e)&&(s="IE"),{device:t,browser:s,icon:n}}function i(){return window.dashboardApp&&window.dashboardApp.currentUserData?window.dashboardApp.currentUserData:null}async function a(e,t){const n=sessionStorage.getItem("accessToken");if(!n)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;try{const s=await fetch(`${SymbioConfig.api_url}/api/auth/change-password`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({current_password:e,new_password:t})});if(s.ok)return await s.json();if(s.status===401){const e=await s.json();throw new Error(e.detail||"Current password is incorrect")}const o=await s.json();throw new Error(o.detail||"Failed to change password")}catch(e){throw e.message?e:(console.error("Change password error:",e),new Error("Failed to change password. Please try again."))}}async function r(){const e=sessionStorage.getItem("accessToken");if(!e)return null;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/sessions`,{method:"GET",headers:{Authorization:`Bearer ${e}`}});if(t.ok)return await t.json();if(t.status===401)return null;throw new Error(`Failed to load sessions: ${t.status}`)}catch(e){throw console.error("Sessions load error:",e),e}}async function c(){const e=sessionStorage.getItem("accessToken");if(!e)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/logout-all`,{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(t.ok)return await t.json();if(t.status===401)return window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect(),null;throw new Error(`Logout failed: ${t.status}`)}catch(e){throw console.error("Logout all error:",e),e}}function l(t){return!t||t.length===0?'<p class="session-empty">No active sessions found.</p>':t.map(t=>{const n=o(t.device_info),i=`${n.device} • ${n.browser}`,a=t.ip_address||"Unknown",r=e(t.created_at),s=t.last_refreshed_at?e(t.last_refreshed_at):null;return`
      <div class="session-item ${t.is_current?"session-current":""}">
        <div class="session-item-header">
          <span class="session-device">
            <span class="session-icon">${n.icon}</span>
            ${i}
          </span>
          ${t.is_current?'<span class="session-current-badge">Current</span>':""}
        </div>
        <div class="session-item-ip">${a}</div>
        <div class="session-item-times">
          <span class="session-time">Logged in ${r}</span>
          ${s?`<span class="session-separator">•</span><span class="session-active">Active ${s}</span>`:""}
        </div>
      </div>
    `}).join("")}function d(){const t=document.getElementById("pane-profile");if(!t)return;const h=t.querySelector("#profile-loading"),O=t.querySelector("#profile-content"),f=t.querySelector("#profile-error"),b=t.querySelector("#profile-error-message"),k=t.querySelector("#profile-email"),E=t.querySelector("#profile-tier"),w=t.querySelector("#profile-verified"),C=t.querySelector("#profile-member-since"),x=t.querySelector("#profile-last-login"),v=t.querySelector("#profile-session-badge"),_=t.querySelector("#profile-session-list"),o=t.querySelector("#logout-all-btn");h.style.display="block",O.style.display="none",f.style.display="none";const j=i();if(!j){b.textContent="User data not available",f.style.display="block",h.style.display="none";return}const d=j.user,y=j.active_sessions;r().then(o=>{const a=o?o.sessions:[],i=t.querySelector("#email");i&&(i.value=d.email),k.textContent=d.email,E.textContent=s(d.subscription_tier),d.email_verified?w.innerHTML='<span class="status-verified">✓ Verified</span>':w.innerHTML='<span class="status-unverified">⚠ Not Verified</span>',C.textContent=n(d.created_at),x.textContent=e(d.last_login),y===1?(v.className="session-badge session-badge-ok",v.textContent="1 device"):(v.className="session-badge session-badge-warning",v.textContent=`${y} devices`),_&&(_.innerHTML=l(a)),h.style.display="none",O.style.display="block"}).catch(e=>{h.style.display="none",b.textContent=e.message||"Failed to load profile",f.style.display="block"}),o&&!o.dataset.initialized&&(o.dataset.initialized="true",o.addEventListener("click",async function(e){e.preventDefault();const t=confirm(`This will log you out of all devices including this one.

Are you sure you want to continue?`);if(!t)return;o.disabled=!0,o.textContent="Logging out...";try{const e=await c();e&&(sessionStorage.removeItem("accessToken"),sessionStorage.removeItem("refreshToken"),sessionStorage.removeItem("username"),window.location.href="/dashboard/login/?message=logged-out")}catch(e){b.textContent=e.message||"Failed to log out of all devices",f.style.display="block",o.disabled=!1,o.textContent="Log Out All Devices"}}));const g=t.querySelector("#change-password-form"),u=t.querySelector("#password-error"),p=t.querySelector("#password-error-message"),m=t.querySelector("#change-password-btn");g&&!g.dataset.initialized&&(g.dataset.initialized="true",g.addEventListener("submit",async function(e){e.preventDefault(),u.style.display="none";const s=t.querySelector("#current-password").value,n=t.querySelector("#new-password").value,o=t.querySelector("#confirm-password").value;if(!s||!n||!o){p.textContent="All fields are required",u.style.display="block";return}if(n!==o){p.textContent="New passwords do not match",u.style.display="block";return}if(n.length<6){p.textContent="New password must be at least 6 characters",u.style.display="block";return}m.disabled=!0,m.textContent="Changing...",t.querySelector("#current-password").disabled=!0,t.querySelector("#new-password").disabled=!0,t.querySelector("#confirm-password").disabled=!0;try{const e=await a(s,n);e&&(sessionStorage.removeItem("accessToken"),sessionStorage.removeItem("refreshToken"),sessionStorage.removeItem("username"),window.location.href="/dashboard/login/?message=password-changed")}catch(e){p.textContent=e.message||"Failed to change password",u.style.display="block",m.disabled=!1,m.textContent="Change Password",t.querySelector("#current-password").disabled=!1,t.querySelector("#new-password").disabled=!1,t.querySelector("#confirm-password").disabled=!1}}))}window.dashboardPages.push({id:"profile",title:"User Profile",html:`
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
  `}),window.addEventListener("dashboardReady",function(){window.dashboardApp.onPageVisible("profile",d)})}(),function(){window.dashboardPages=window.dashboardPages||[];function c(e){return e?e.split("-").join(" "):"Unknown"}function e(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function h(e){return e?new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):"Unknown"}let s=null,n=null;async function t(e=null){const o=document.getElementById("roles-list");if(!o)return;o.innerHTML='<p class="loading-text">Loading roles...</p>',s=e;try{const a=sessionStorage.getItem("accessToken");let i=`${SymbioConfig.api_url}/api/roles/list`;e&&(i+=`?resource_id=${e}`);const s=await fetch(i,{method:"GET",headers:{Authorization:`Bearer ${a}`}});if(!s.ok)throw new Error(`API returned ${s.status}`);const t=await s.json();e&&t.roles&&t.roles.length>0?n=t.roles[0].resource_name:e&&(n="this resource"),u(o,t.roles,e)}catch(s){console.error("Failed to load roles:",s),o.innerHTML=`
        <p class="error-text">Failed to load roles. <a href="#" id="retry-roles-load">Retry</a></p>
      `;const n=o.querySelector("#retry-roles-load");n&&n.addEventListener("click",n=>{n.preventDefault(),t(e)})}}function o(){s=null,n=null;const e=new URL(window.location);e.searchParams.delete("resource_id"),e.searchParams.delete("role_id"),window.history.pushState({},"",e),t()}function r(e){const t={};return e.forEach(e=>{const n=e.resource_type||"unknown",s=e.resource_id;t[n]||(t[n]={}),t[n][s]||(t[n][s]={resource_name:e.resource_name||"Unknown Resource",is_admin:e.is_admin||!1,roles:[]}),e.is_admin&&(t[n][s].is_admin=!0),t[n][s].roles.push(e)}),Object.keys(t).forEach(e=>{Object.keys(t[e]).forEach(n=>{t[e][n].roles.sort((e,t)=>e.role_name==="owner"?-1:t.role_name==="owner"?1:e.role_name.localeCompare(t.role_name))})}),t}function i(t,n){const i=t.role_name==="owner",a=h(t.created_at),o=[`Created: ${a}`];o.push(`Users: ${t.user_count}`);let s="";return i?s=`
        <button class="btn btn-sm btn-secondary btn-role-users" data-role-id="${t.id}">Users</button>
      `:n?s=`
        <button class="btn btn-sm btn-secondary btn-role-users" data-role-id="${t.id}">Users</button>
        <button class="btn btn-sm btn-secondary" disabled title="Coming soon">Settings</button>
        <button class="btn btn-sm btn-danger btn-delete-role" data-role-id="${t.id}" data-role-name="${e(t.role_name)}">Delete</button>
      `:s=`
        <button class="btn btn-sm btn-secondary btn-role-users" data-role-id="${t.id}">Users</button>
      `,`
      <div class="item-card" data-role-id="${t.id}">
        <div class="item-info">
          <h4 class="item-name">${e(t.role_name)}</h4>
          <div class="item-meta">
            ${o.map(e=>`<span class="meta-item">${e}</span>`).join("")}
          </div>
        </div>
        <div class="item-actions">
          ${s}
        </div>
      </div>
    `}function l(t,n,s){const o=n?'<span class="item-badge item-badge-owner">Owner</span>':"",i=n?`<button class="btn btn-primary btn-sm btn-add-role" data-resource-id="${s}" data-resource-name="${e(t)}">+ Add Role</button>`:"";return`
      <div class="card-header-row">
        <h3>${e(t)} ${o}</h3>
        ${i}
      </div>
    `}function d(t){return`
      <div class="filter-banner">
        <span class="filter-text">
          Filtered by: <strong>${e(t)}</strong>
        </span>
        <button class="btn btn-sm btn-secondary" id="clear-filter-btn">Show All Roles</button>
      </div>
    `}function u(t,s,o=!1){let a="";if(o&&n&&(a+=d(n)),!s||s.length===0){const e=o?"No roles found for this resource.":"No roles found. Create a namespace to get started!";a+=`<p class="empty-state">${e}</p>`,t.innerHTML=a,v(t);return}const u=r(s);Object.keys(u).sort().forEach(t=>{const s=c(t),n=u[t],o=Object.keys(n);a+=`<h2>${e(s)}</h2>`,o.forEach(e=>{const t=n[e],s=t.roles.map(e=>i(e,t.is_admin)).join("");a+=`<div class="profile-card">`,a+=l(t.resource_name,t.is_admin,e),a+=`
          <div class="resource-group">
            ${s}
          </div>
        `,a+=`</div>`})}),t.innerHTML=a,g(t)}async function a(e,t){const s=sessionStorage.getItem("accessToken"),n=await fetch(`${SymbioConfig.api_url}/api/roles/create`,{method:"POST",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},body:JSON.stringify({resource_id:e,role_name:t})});if(!n.ok){const e=await n.json().catch(()=>({}));throw new Error(e.detail||`API returned ${n.status}`)}return await n.json()}async function m(e){const n=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/roles/delete`,{method:"DELETE",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({role_id:e})});if(!t.ok){const e=await t.json().catch(()=>({}));throw new Error(e.detail||`API returned ${t.status}`)}return await t.json()}function f(n,o){window.dashboardApp.showDialog({title:`Create Role for ${o}`,content:`
        <p class="dialog-description">Create a new role for the resource "<strong>${e(o)}</strong>".</p>
        <div class="dialog-input-group">
          <label for="role-name">Role Name</label>
          <input type="text" id="role-name" placeholder="e.g., content-editor" autocomplete="off" maxlength="30">
          <span class="input-hint">2-30 characters, no special characters.</span>
        </div>
        <div id="create-error" class="dialog-error" style="display: none;"></div>
      `,buttons:[{text:"Cancel",action:"close"},{text:"Create",class:"btn-primary",action:async function(){const i=document.getElementById("role-name"),e=document.getElementById("create-error"),r=i.value.trim();if(r.length<2){e.textContent="Role name must be at least 2 characters",e.style.display="block",i.focus();return}const o=document.querySelector(".symbio-dialog-footer .btn-primary"),c=o.textContent;o.textContent="Creating...",o.disabled=!0,e.style.display="none";try{await a(n,r),window.dashboardApp.hideDialog(),t(s)}catch(t){e.textContent=t.message,e.style.display="block",o.textContent=c,o.disabled=!1}}}]}),setTimeout(()=>{const e=document.getElementById("role-name");e&&e.focus()},150)}function p(n,o){window.dashboardApp.showDialog({title:"Delete Role",content:`
        <p class="dialog-warning">Are you sure you want to delete the role "<strong>${e(o)}</strong>"?</p>
        <p class="dialog-warning-emphasis">This action cannot be undone.</p>
        <div id="delete-error" class="dialog-error" style="display: none;"></div>
      `,buttons:[{text:"Cancel",action:"close"},{text:"Delete Role",class:"btn-danger",action:async function(){const o=document.getElementById("delete-error"),e=document.querySelector(".symbio-dialog-footer .btn-danger"),i=e.textContent;e.textContent="Deleting...",e.disabled=!0,o.style.display="none";try{await m(n),window.dashboardApp.hideDialog(),t(s)}catch(t){o.textContent=t.message,o.style.display="block",e.textContent=i,e.disabled=!1}}}]})}function g(e){const t=e.querySelector("#clear-filter-btn");t&&t.addEventListener("click",o),e.querySelectorAll(".btn-add-role").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.resourceId,n=e.dataset.resourceName;f(t,n)})}),e.querySelectorAll(".btn-role-users").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.roleId;console.log("Users clicked for role:",t)})}),e.querySelectorAll(".btn-delete-role").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.roleId,t=e.dataset.roleName;if(t==="owner"){window.dashboardApp.showDialog({title:"Action Not Allowed",content:'<p>The "owner" role cannot be deleted.</p>',buttons:[{text:"OK",action:"close"}]});return}p(n,t)})})}function v(e){const t=e.querySelector("#clear-filter-btn");t&&t.addEventListener("click",o)}function b(){const e=document.getElementById("pane-roles");if(!e)return;const n=window.dashboardApp.getUrlParam("resource_id");t(n)}window.dashboardPages.push({id:"roles",title:"Roles",html:`
      <div class="page-header">
        <h2>Roles</h2>
        <p>View and manage your roles across all resources.</p>
      </div>
      <div class="page-content">
        <div id="roles-list">
          <p class="loading-text">Loading roles...</p>
        </div>
      </div>
    `}),window.addEventListener("dashboardReady",function(){window.dashboardApp.onPageVisible("roles",b)})}(),function(){window.dashboardPages=window.dashboardPages||[],window.dashboardPages.push({id:"memory-mcp",title:"Memory MCP",type:"section",expanded:!0,children:[{id:"memory-mcp-resources",title:"Namespaces",html:`
          <div class="page-header">
            <h2>Namespaces</h2>
            <p>Separate memory storage areas for different AI assistants or projects.</p>
          </div>
          <div class="page-content">
            <div class="profile-card">
              <div class="card-header-row">
                <h3>Your Resources</h3>
                <button class="btn btn-primary btn-sm" id="add-namespace-btn">+ Add Namespace</button>
              </div>
              <div id="namespaces-list">
                <p class="loading-text">Loading namespace resources...</p>
              </div>
            </div>
          </div>
        `},{id:"memory-mcp-embeddings",title:"Embeddings",html:`
          <div class="page-header">
            <h2>Placeholder</h2>
            <p>Another page within the same section.</p>
          </div>
          <div class="page-content">
            <p>All pages in a section share the same collapsible parent in the nav.</p>
            <button onclick="alert('Hello from the second demo page!')">Click Me</button>
          </div>
        `}]});async function t(){const e=document.getElementById("namespaces-list");if(!e)return;e.innerHTML='<p class="loading-text">Loading namespaces...</p>';try{const s=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/memory-mcp/resources/list`,{method:"GET",headers:{Authorization:`Bearer ${s}`}});if(!t.ok)throw new Error(`API returned ${t.status}`);const o=await t.json();n(e,o.resources)}catch(s){console.error("Failed to load namespaces:",s),e.innerHTML=`
        <p class="error-text">Failed to load namespaces. <a href="#" id="retry-load">Retry</a></p>
      `;const n=e.querySelector("#retry-load");n&&n.addEventListener("click",e=>{e.preventDefault(),t()})}}function n(t,n){if(!n||n.length===0){t.innerHTML=`
        <p class="empty-state">No namespaces yet. Create one to get started!</p>
      `;return}const s=n.map(t=>{const n=new Date(t.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),s=t.embedding_config_id?"Custom":"System Default";return`
        <div class="item-card" data-namespace-id="${t.id}">
          <div class="item-info">
            <h4 class="item-name">${e(t.friendly_name)}</h4>
            <div class="item-meta">
              <span class="meta-item">Created: ${n}</span>
              <span class="meta-item">Embeddings: ${s}</span>
            </div>
          </div>
          <div class="item-actions">
            ${t.is_admin?`<button class="btn btn-sm btn-secondary btn-roles-namespace" data-id="${t.id}" data-name="${e(t.friendly_name)}">Roles</button>`:""}
            <button class="btn btn-sm btn-secondary" disabled title="Coming soon">Settings</button>
            ${t.is_admin?`<button class="btn btn-sm btn-danger btn-delete-namespace" data-id="${t.id}" data-name="${e(t.friendly_name)}">Delete</button>`:""}
          </div>
        </div>
      `}).join("");t.innerHTML=s,t.querySelectorAll(".btn-delete-namespace").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.id,n=e.dataset.name;l(t,n)})}),t.querySelectorAll(".btn-roles-namespace").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.id,n=e.dataset.name;c(t,n)})})}function e(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function s(e){const n=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/memory-mcp/resources/create`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({friendly_name:e})});if(!t.ok){const e=await t.json().catch(()=>({}));throw new Error(e.detail||`API returned ${t.status}`)}return await t.json()}async function o(e){const n=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/memory-mcp/resources/delete`,{method:"DELETE",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({resource_id:e})});if(!t.ok){const e=await t.json().catch(()=>({}));throw new Error(e.detail||`API returned ${t.status}`)}return await t.json()}function i(){window.dashboardApp.showDialog({title:"Create Namespace",content:`
        <p class="dialog-description">Create a new namespace for storing AI memories.</p>
        <div class="dialog-input-group">
          <label for="namespace-name">Namespace Name</label>
          <input type="text" id="namespace-name" placeholder="e.g., My AI Assistant" autocomplete="off" maxlength="40">
          <span class="input-hint">2-40 characters</span>
        </div>
        <div id="create-error" class="dialog-error" style="display: none;"></div>
      `,buttons:[{text:"Cancel",action:"close"},{text:"Create",class:"btn-primary",action:async function(){const o=document.getElementById("namespace-name"),e=document.getElementById("create-error"),i=o.value.trim();if(i.length<2){e.textContent="Name must be at least 2 characters",e.style.display="block",o.focus();return}const n=document.querySelector(".symbio-dialog-footer .btn-primary"),a=n.textContent;n.textContent="Creating...",n.disabled=!0,e.style.display="none";try{await s(i),window.dashboardApp.hideDialog(),t()}catch(t){e.textContent=t.message,e.style.display="block",n.textContent=a,n.disabled=!1}}}]}),setTimeout(()=>{const e=document.getElementById("namespace-name");e&&e.focus()},150)}async function a(e){const n=sessionStorage.getItem("accessToken"),t=await fetch(`${SymbioConfig.api_url}/api/roles/list?resource_id=${e}&resource_type=memory-mcp`,{method:"GET",headers:{Authorization:`Bearer ${n}`}});if(!t.ok)throw new Error(`API returned ${t.status}`);return await t.json()}function r(e){return e?new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):"Unknown"}async function c(t,n){window.dashboardApp.showDialog({title:`Roles for ${n}`,content:'<p class="loading-text">Loading roles...</p>',buttons:[{text:"Close",action:"close"},{text:"Manage All Roles",class:"btn-primary",action:function(){const e=window.dashboardApp.buildUrl("/dashboard/home/",{tab:"roles",resource_id:t});window.dashboardApp.hideDialog(),window.location.href=e}}]});try{const n=await a(t),s=document.querySelector(".symbio-dialog-content");if(!n.roles||n.roles.length===0){s.innerHTML=`
          <p class="empty-state">No roles were found for this namespace.</p>
          <p class="dialog-description">Use "Manage All Roles" to create or manage roles.</p>
        `;return}const o=n.roles.map(t=>`
        <div class="dialog-role-item" data-role-id="${t.id}">
          <div class="dialog-role-info">
            <span class="dialog-role-name">${e(t.role_name)}</span>
            <span class="dialog-role-meta">Created: ${r(t.created_at)}</span>
          </div>
          <span class="dialog-role-arrow">→</span>
        </div>
      `).join("");s.innerHTML=`
        <p class="dialog-description">Click a role to view details on the Roles page:</p>
        <div class="dialog-role-list">
          ${o}
        </div>
      `,s.querySelectorAll(".dialog-role-item").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.roleId,s=window.dashboardApp.buildUrl("/dashboard/home/",{tab:"roles",resource_id:t,role_id:n});window.dashboardApp.hideDialog(),window.location.href=s})})}catch(e){console.error("Failed to load roles:",e);const t=document.querySelector(".symbio-dialog-content");t.innerHTML=`
        <p class="error-text">Failed to load roles. Please try again.</p>
      `}}function l(n,s){window.dashboardApp.showDialog({title:"Delete Namespace",content:`
        <p class="dialog-warning">⚠️ This will permanently delete the namespace "<strong>${e(s)}</strong>" and all associated roles and credentials.</p>
        <p class="dialog-warning-emphasis">This cannot be undone.</p>
        <div id="delete-error" class="dialog-error" style="display: none;"></div>
      `,buttons:[{text:"Cancel",action:"close"},{text:"Delete Namespace",class:"btn-danger",action:async function(){const s=document.getElementById("delete-error"),e=document.querySelector(".symbio-dialog-footer .btn-danger"),i=e.textContent;e.textContent="Deleting...",e.disabled=!0,s.style.display="none";try{await o(n),window.dashboardApp.hideDialog(),t()}catch(t){s.textContent=t.message,s.style.display="block",e.textContent=i,e.disabled=!1}}}]})}function d(){const n=document.getElementById("pane-memory-mcp-resources");if(!n)return;const e=n.querySelector("#add-namespace-btn");e&&!e.dataset.initialized&&(e.dataset.initialized="true",e.addEventListener("click",i)),t()}window.addEventListener("dashboardReady",function(){window.dashboardApp.onPageVisible("memory-mcp-resources",d)})}(),function(){window.dashboardPages=window.dashboardPages||[],window.dashboardPages.push({id:"admin-users",title:"Users",type:"section",expanded:!0,requiresSuperuser:!0,children:[{id:"create-user",title:"Create User",html:`
          <div class="page-header">
            <h2>Create User</h2>
            <p>Create a new user account.</p>
          </div>
          <div class="page-content">
            <div class="profile-card">
              <h3>New User Details</h3>
              <form id="create-user-form" class="password-form">
                <div class="password-input-group">
                  <label for="new-user-email">Email Address</label>
                  <input type="email" id="new-user-email" placeholder="user@example.com" required>
                </div>
                <div class="password-input-group">
                  <label for="new-user-password">Initial Password</label>
                  <input type="password" id="new-user-password" placeholder="Password for new user" required>
                  <span class="input-hint">The user can change this after logging in.</span>
                </div>
                <div class="password-input-group">
                  <label for="superuser-confirm-password">Your Password (Confirmation)</label>
                  <input type="password" id="superuser-confirm-password" placeholder="Enter your password to confirm" required>
                  <span class="input-hint">Required to verify this action.</span>
                </div>
                <div id="create-user-error" class="dialog-error" style="display: none;"></div>
                <div id="create-user-success" class="create-user-success" style="display: none;"></div>
                <button type="submit" class="btn btn-primary" id="create-user-btn">Create User</button>
              </form>
            </div>
          </div>
        `}]});function e(){const a=document.getElementById("create-user-form"),e=document.getElementById("new-user-email"),t=document.getElementById("new-user-password"),n=document.getElementById("superuser-confirm-password"),r=document.getElementById("create-user-btn"),s=document.getElementById("create-user-error"),o=document.getElementById("create-user-success");if(!a)return;a.addEventListener("submit",async a=>{a.preventDefault(),s.style.display="none",o.style.display="none";const r=e.value.trim(),d=t.value,u=n.value;if(!r||!d||!u){i("All fields are required.");return}c(!0);try{const s=sessionStorage.getItem("accessToken");if(!s){window.SymbioAuth&&window.SymbioAuth.clearAuthAndRedirect();return}const o=await fetch(`${SymbioConfig.api_url}/api/superuser/create-user`,{method:"POST",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},body:JSON.stringify({email:r,password:d,superuser_password:u})}),a=await o.json();if(o.ok)l(a.user.email),e.value="",t.value="",n.value="";else{const e=a.detail||"Failed to create user";i(e)}}catch(e){console.error("Create user error:",e),i("Network error. Please try again.")}finally{c(!1)}});function i(e){s.textContent=e,s.style.display="block"}function l(e){o.innerHTML=`
        <div class="success-icon">✓</div>
        <div class="success-message">
          <strong>User created successfully!</strong><br>
          <span class="success-email">${d(e)}</span> can now log in.
        </div>
      `,o.style.display="flex"}function c(s){e.disabled=s,t.disabled=s,n.disabled=s,r.disabled=s,r.textContent=s?"Creating...":"Create User"}function d(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}window.addEventListener("dashboardReady",function(){window.dashboardApp.onPageVisible("create-user",e)})}(),function(){window.dashboardPages=window.dashboardPages||[],window.dashboardPages.push({id:"admin-pages",title:"Administration",type:"section",expanded:!0,requiresSuperuser:!0,children:[{id:"adminpage1",title:"Namespaces",html:`
          <div class="page-header">
            <h2>Namespaces</h2>
            <p>Separate memory storage areas for different AI assistants or projects.</p>
          </div>
          <div class="page-content">
            <div class="profile-card">
              <div class="card-header-row">
                <h3>Your Resources</h3>
                <button class="btn btn-primary btn-sm" id="add-namespace-btn">+ Add Namespace</button>
              </div>
              <div id="namespaces-list">
                <p class="loading-text">Loading namespace resources...</p>
              </div>
            </div>
          </div>
        `},{id:"adminpage2",title:"Embeddings",html:`
          <div class="page-header">
            <h2>Placeholder</h2>
            <p>Another page within the same section.</p>
          </div>
          <div class="page-content">
            <p>All pages in a section share the same collapsible parent in the nav.</p>
            <button onclick="alert('Hello from the second demo page!')">Click Me</button>
          </div>
        `}]}),window.addEventListener("dashboardReady",function(){window.dashboardApp.onPageVisible("adminpage1",initNamespacePage)})}()