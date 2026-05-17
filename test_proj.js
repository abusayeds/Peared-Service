const baseUrl = "https://api.peardup.com/api/v1";
async function test() {
  const loginRes = await fetch(`${baseUrl}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "provider3@gmail.com", password: "1qazxsw2" })
  });
  const data = await loginRes.json();
  const token = data.data.token;
  
  if (token) {
    const profRes = await fetch(`${baseUrl}/user/my-profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Profile3:", await profRes.json());
  } else {
    console.log("Login failed for provider3");
  }
}
test();
