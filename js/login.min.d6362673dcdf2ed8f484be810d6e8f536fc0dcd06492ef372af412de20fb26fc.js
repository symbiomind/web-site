document.addEventListener("DOMContentLoaded",function(){const n={"session-expired":{text:"Your session has expired. Please log in again.",type:"warning"},"logged-out":{text:"Successfully logged out of all devices.",type:"success"},"password-changed":{text:"Password changed successfully. Please log in with your new password.",type:"success"}};function s(e){const t=document.getElementById("login-error-callout");t.classList.remove("warning","success","error","info"),t.classList.add(e)}function i(e,t="info",n=!1){window.innerWidth>768?(s(t),document.getElementById("login-error-message").textContent=e,document.getElementById("login-error-callout").style.display="block",n&&setTimeout(()=>{document.getElementById("login-error-callout").style.display="none"},5e3)):alert(e)}function e(e){window.innerWidth>768?(s("error"),document.getElementById("login-error-message").textContent=e,document.getElementById("login-error-callout").style.display="block",setTimeout(()=>{document.getElementById("login-error-callout").style.display="none"},5e3)):alert(e)}function a(){const e=document.getElementById("login-container");innerHTML=`
    <div id="login-header">
        <h3>Login</h3>
    </div>
    <div>
        <form id="login-form">
            <div class="input-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" autocomplete="username" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" autocomplete="current-password" required>
            </div>
            <div class="login-link login-right">
                <a href="/under-construction/" id="forgot-password-link">Forgot Password?</a>
            </div>
            <button type="submit" id="login-button">Login</button>
            <div class="login-link login-center">
                <a href="/under-construction/" id="register-link">Sign Up!</a>
            </div>
        </form>
    </div>
    `,e&&(e.innerHTML=innerHTML)}a();const r=new URLSearchParams(window.location.search),t=r.get("message");if(t&&n[t]){const e=n[t];i(e.text,e.type,!1);const s=window.location.pathname;window.history.replaceState({},"",s)}const o=document.getElementById("login-form");o&&o.addEventListener("submit",async function(t){t.preventDefault();const n=document.getElementById("email").value,s=document.getElementById("password").value;try{const t=await fetch(`${SymbioConfig.api_url}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:s})});if(t.ok){const e=await t.json();sessionStorage.setItem("accessToken",e.access_token),sessionStorage.setItem("refreshToken",e.refresh_token),window.location.href="/dashboard/home/"}else try{const n=await t.json();let s="Login failed. Please try again.";if(Array.isArray(n.detail)&&n.detail.length>0){const e=n.detail[0];s=e.ctx?.reason||e.msg||s}else typeof n.detail=="string"?s=n.detail:n.error&&(s=n.error);e(s)}catch{e("Login failed. Please check your credentials.")}}catch(t){console.error("Login error:",t),e("API service temporarily unavailable. Please try again later.")}})})