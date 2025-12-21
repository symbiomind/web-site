document.addEventListener("DOMContentLoaded",function(){console.log("DOM is ready!");function t(){const e=document.getElementById("login-container");innerHTML=`
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
    `,e&&(e.innerHTML=innerHTML)}t();const e=document.getElementById("login-form");e&&e.addEventListener("submit",async function(e){e.preventDefault();const t=document.getElementById("email").value,n=document.getElementById("password").value;try{const e=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:n})});if(e.ok){const t=await e.json();sessionStorage.setItem("accessToken",t.access_token),sessionStorage.setItem("refreshToken",t.refresh_token),window.location.href="/dashboard/home/"}else alert("Login failed. Please check your credentials.")}catch(e){console.error("Login error:",e),alert("An error occurred during login. Please try again.")}})})