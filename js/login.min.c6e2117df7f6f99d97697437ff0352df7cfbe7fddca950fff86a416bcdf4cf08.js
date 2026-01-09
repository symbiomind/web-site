document.addEventListener("DOMContentLoaded",function(){console.log("DOM is ready!");function e(e){window.innerWidth>768?(document.getElementById("login-error-message").textContent=e,document.getElementById("login-error-callout").style.display="block",setTimeout(()=>{document.getElementById("login-error-callout").style.display="none"},5e3)):alert(e)}function n(){const e=document.getElementById("login-container");innerHTML=`
    <div id="login-header">
        <h3>Login</h3>
    </div>
    <div>
        <form id="login-form">
            <div class="input-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
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
    `,e&&(e.innerHTML=innerHTML)}n();const t=document.getElementById("login-form");t&&t.addEventListener("submit",async function(t){t.preventDefault();const n=document.getElementById("email").value,s=document.getElementById("password").value;try{const t=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:s})});if(t.ok){const e=await t.json();sessionStorage.setItem("accessToken",e.access_token),sessionStorage.setItem("refreshToken",e.refresh_token),window.location.href="/dashboard/home/"}else try{const n=await t.json(),s=n.detail||n.error||"Login failed. Please try again.";e(s)}catch{e("Login failed. Please check your credentials.")}}catch(t){console.error("Login error:",t),e("API service temporarily unavailable. Please try again later.")}})})