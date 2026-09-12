(() => {
"use strict";
const cfg=window.RC53_SUPABASE||{};
const ready=cfg.url&&!cfg.url.includes("PASTE_")&&cfg.publishableKey&&!cfg.publishableKey.includes("PASTE_");
const sb=ready?window.supabase.createClient(cfg.url,cfg.publishableKey):null;
const $=s=>document.querySelector(s);
let cache={config:null,media:[],hero:[],products:[],stories:[],daily:null};

function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2600)}
function requireSB(){if(!sb){toast("First add your Supabase URL and publishable key in js/config.js");return false}return true}
async function isCurrentUserAdmin(){
  if(!sb) return false;
  const { data: sessionData, error: sessionError } = await sb.auth.getSession();
  if(sessionError || !sessionData.session) return false;
  const { data, error } = await sb.rpc("is_admin");
  if(error){
    console.error("Admin check failed:", error);
    return false;
  }
  return data === true;
}
async function load(){
  if(!sb || !window.__RC53_AUTHORIZED__) return;
  try{
    const results = await Promise.all([
      sb.from("site_config").select("*").limit(1).maybeSingle(),
      sb.from("media_library").select("*").order("created_at",{ascending:false}),
      sb.from("hero_slides").select("*").order("sort_order"),
      sb.from("products").select("*").order("sort_order"),
      sb.from("stories").select("*").order("sort_order"),
      sb.from("daily_cake").select("*").order("updated_at",{ascending:false}).limit(1).maybeSingle()
    ]);
    const [c,m,h,p,s,d]=results;
    const firstError=[c,m,h,p,s,d].find(x=>x.error);
    if(firstError) throw firstError.error;
    cache={config:c.data||{},media:m.data||[],hero:h.data||[],products:p.data||[],stories:s.data||[],daily:d.data||null};
    renderAll();
  }catch(e){
    console.error(e);
    toast("Could not load bakery data: "+e.message);
  }
}
async function requireAdmin(){
  if(!sb){
    toast("Add the Supabase URL and publishable key in js/config.js");
    return false;
  }
  if(window.__RC53_AUTHORIZED__) return true;
  const ok=await isCurrentUserAdmin();
  if(!ok){
    toast("Please sign in as the bakery administrator first.");
    return false;
  }
  return true;
}
function nav(page){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 $("#page-"+page).classList.add("active");
 document.querySelectorAll("#sideNav button").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 const title={dashboard:"Dashboard",media:"Photo Library",hero:"Homepage",products:"Products",stories:"Stories",daily:"Cake of Day",settings:"Settings"}[page];
 $("#pageTitle").textContent=title;
 $("#app").classList.add("visible");
 if(innerWidth<850)document.querySelector(".sidebar").classList.remove("open");
}
document.querySelectorAll("#sideNav button").forEach(b=>b.onclick=()=>nav(b.dataset.page));
document.querySelectorAll("[data-page-go]").forEach(b=>b.onclick=()=>nav(b.dataset.pageGo));
$("#menuToggle").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");

async function fileToUrl(file){
  if(!file) return "";
  if(!(await requireAdmin())) throw new Error("Administrator authentication required.");
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
  const path=`uploads/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const {error}=await sb.storage.from("royal-cakes").upload(path,file,{
    upsert:false,
    cacheControl:"31536000",
    contentType:file.type || "image/jpeg"
  });
  if(error) throw error;
  return sb.storage.from("royal-cakes").getPublicUrl(path).data.publicUrl;
}
async function uploadMedia(files, placement){
  if(!(await requireAdmin())||!files.length)return;
 for(const file of [...files]){
  try{
   const url=await fileToUrl(file);
   const {data,error}=await sb.from("media_library").insert({image_url:url,caption:file.name.replace(/\.[^.]+$/,""),published:true,sort_order:0}).select().single();
   if(error)throw error;
   if(placement==="hero")await sb.from("hero_slides").insert({image_url:url,eyebrow:"ROYAL CAKES 53",title:"Every celebration deserves something royal.",description:"Beautifully crafted for moments worth remembering.",sort_order:cache.hero.length,active:true});
   if(placement==="story")await sb.from("stories").insert({image_url:url,title:"Royal Story",caption:"Fresh from Royal Cakes 53.",sort_order:cache.stories.length,active:true});
   if(placement==="gallery"){}
  }catch(e){toast("Upload failed: "+e.message)}
 }
 toast("Photo uploaded successfully");await load();
}
$("#mediaUpload").onchange=e=>uploadMedia(e.target.files,"gallery");
$("#heroUpload").onchange=e=>uploadMedia(e.target.files,"hero");
$("#storyUpload").onchange=e=>uploadMedia(e.target.files,"story");
$("#uploadBox").onclick=()=>$("#mediaUpload").click();

function renderDashboard(){
 $("#statProducts").textContent=cache.products.length;$("#statHero").textContent=cache.hero.length;$("#statStories").textContent=cache.stories.length;$("#statMedia").textContent=cache.media.length;
}
function renderMedia(){
 $("#mediaGrid").innerHTML=cache.media.length?cache.media.map(m=>`<article class="media-card"><img src="${m.image_url}" alt=""><div><input value="${esc(m.caption||"")}" data-caption="${m.id}"><div class="media-actions"><button data-copy="${m.image_url}">Copy link</button><button class="danger" data-delete="${m.id}">Delete</button></div></div></article>`).join(""):'<div class="empty">No photos yet. Upload your first bakery photo.</div>';
 document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copy);toast("Photo link copied")});
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteMedia(b.dataset.delete));
 document.querySelectorAll("[data-caption]").forEach(i=>i.onchange=async()=>{await sb.from("media_library").update({caption:i.value}).eq("id",i.dataset.caption);toast("Caption saved")});
}
async function deleteMedia(id){if(!confirm("Delete this photo from the library? Existing places using it may still show until changed."))return;const m=cache.media.find(x=>x.id===id);await sb.from("media_library").delete().eq("id",id);if(m?.image_url){const file=m.image_url.split("/royal-cakes/")[1];if(file)await sb.storage.from("royal-cakes").remove([file])}toast("Photo deleted");load()}

function renderHero(){
 $("#heroList").innerHTML=cache.hero.length?cache.hero.map((h,i)=>`<article class="editor"><img src="${h.image_url}" alt=""><div class="editor-fields"><label>Eyebrow<input data-h="${h.id}" data-f="eyebrow" value="${esc(h.eyebrow||"ROYAL CAKES 53")}"></label><label>Title<input data-h="${h.id}" data-f="title" value="${esc(h.title||"Every celebration deserves something royal.")}"></label><label>Description<input data-h="${h.id}" data-f="description" value="${esc(h.description||"") }"></label><label>Order<input class="small" type="number" data-h="${h.id}" data-f="sort_order" value="${h.sort_order||0}"></label><div class="row"><button class="gold" data-save-hero="${h.id}">Save</button><button class="danger" data-del-hero="${h.id}">Delete</button></div></div></article>`).join(""):'<div class="empty">Add hero photos to create the cinematic homepage opening.</div>';
 document.querySelectorAll("[data-save-hero]").forEach(b=>b.onclick=async()=>{if(!(await requireAdmin()))return;const id=b.dataset.saveHero;const obj={};document.querySelectorAll(`[data-h="${id}"]`).forEach(x=>obj[x.dataset.f]=x.type==="number"?+x.value:x.value);await sb.from("hero_slides").update(obj).eq("id",id);toast("Homepage slide saved");load()});
 document.querySelectorAll("[data-del-hero]").forEach(b=>b.onclick=async()=>{if(!(await requireAdmin()))return;await sb.from("hero_slides").delete().eq("id",b.dataset.delHero);toast("Slide removed");load()});
}
$("#newProduct").onclick=async()=>{if(!(await requireAdmin()))return;const {error}=await sb.from("products").insert({name:"New Cake",description:"",category:"Cakes",price:0,available:true,featured:false,sort_order:cache.products.length});if(error)toast(error.message);else load()};

function renderProducts(){
 $("#productEditor").innerHTML=cache.products.length?cache.products.map(p=>`<article class="product-editor"><div class="product-thumb">${p.image_url?`<img src="${p.image_url}" alt="">`:""}</div><div class="editor-fields"><label>Name<input data-p="${p.id}" data-f="name" value="${esc(p.name)}"></label><div class="two"><label>Category<input data-p="${p.id}" data-f="category" value="${esc(p.category||"Cakes")}"></label><label>Price<input type="number" min="0" data-p="${p.id}" data-f="price" value="${p.price||0}"></label></div><label>Description<textarea data-p="${p.id}" data-f="description">${esc(p.description||"")}</textarea><label>Photo<select data-p="${p.id}" data-f="image_url">${mediaOptions(p.image_url)}</select></label><div class="row"><button class="gold" data-save-product="${p.id}">Save product</button><button class="danger" data-del-product="${p.id}">Delete</button></div></div></article>`).join(""):'<div class="empty">No products yet. Tap “New product” to add one.</div>';
 document.querySelectorAll("[data-save-product]").forEach(b=>b.onclick=async()=>{if(!(await requireAdmin()))return;const id=b.dataset.saveProduct,obj={};document.querySelectorAll(`[data-p="${id}"]`).forEach(x=>obj[x.dataset.f]=x.type==="number"?+x.value:x.value);await sb.from("products").update(obj).eq("id",id);toast("Product published");load()});
 document.querySelectorAll("[data-del-product]").forEach(b=>b.onclick=async()=>{if(!(await requireAdmin()))return;if(confirm("Delete this product?")){await sb.from("products").delete().eq("id",b.dataset.delProduct);load()}});
}
function mediaOptions(selected){return '<option value="">No photo</option>'+cache.media.map(m=>`<option value="${m.image_url}" ${m.image_url===selected?"selected":""}>${esc(m.caption||"Photo")}</option>`).join("")}

function renderStories(){
 $("#storyEditor").innerHTML=cache.stories.length?cache.stories.map(s=>`<article class="editor"><img src="${s.image_url}" alt=""><div class="editor-fields"><label>Story title<input data-s="${s.id}" data-f="title" value="${esc(s.title||"Royal Story")}"></label><label>Caption<input data-s="${s.id}" data-f="caption" value="${esc(s.caption||"")}"></label><label>Photo<select data-s="${s.id}" data-f="image_url">${mediaOptions(s.image_url)}</select></label><div class="row"><button class="gold" data-save-story="${s.id}">Save</button><button class="danger" data-del-story="${s.id}">Delete</button></div></div></article>`).join(""):'<div class="empty">No stories yet. Add story photos above.</div>';
 document.querySelectorAll("[data-save-story]").forEach(b=>b.onclick=async()=>{if(!(await requireAdmin()))return;const id=b.dataset.saveStory,obj={};document.querySelectorAll(`[data-s="${id}"]`).forEach(x=>obj[x.dataset.f]=x.value);await sb.from("stories").update(obj).eq("id",id);toast("Story published");load()});
 document.querySelectorAll("[data-del-story]").forEach(b=>b.onclick=async()=>{if(!(await requireAdmin()))return;await sb.from("stories").delete().eq("id",b.dataset.delStory);load()});
}
function renderDaily(){
 const d=cache.daily||{};$("#dailyTitleInput").value=d.title||"Cake of the Day";$("#dailyDescInput").value=d.description||"A fresh royal creation, specially selected for today.";$("#dailyPriceInput").value=d.price||"";$("#dailyPhotoSelect").innerHTML=mediaOptions(d.image_url);preview("#dailyPreview",d.image_url);
}
$("#dailyPhotoSelect").onchange=()=>preview("#dailyPreview",$("#dailyPhotoSelect").value);
$("#saveDaily").onclick=async()=>{if(!(await requireAdmin()))return;const row={title:$("#dailyTitleInput").value,description:$("#dailyDescInput").value,price:$("#dailyPriceInput").value?+$("#dailyPriceInput").value:null,image_url:$("#dailyPhotoSelect").value||null,active:true,updated_at:new Date().toISOString()};if(cache.daily)await sb.from("daily_cake").update(row).eq("id",cache.daily.id);else await sb.from("daily_cake").insert(row);toast("Cake of the Day published");load()};
function renderSettings(){
 const c=cache.config||{};$("#setName").value=c.bakery_name||"Royal Cakes 53";$("#setTagline").value=c.tagline||"";$("#setWhatsApp").value=c.whatsapp_number||"";$("#logoSelect").innerHTML=mediaOptions(c.logo_url);preview("#logoPreview",c.logo_url);
}
$("#logoSelect").onchange=()=>preview("#logoPreview",$("#logoSelect").value);
$("#saveSettings").onclick=async()=>{if(!(await requireAdmin()))return;const row={bakery_name:$("#setName").value,tagline:$("#setTagline").value,whatsapp_number:$("#setWhatsApp").value,logo_url:$("#logoSelect").value||null,updated_at:new Date().toISOString()};if(cache.config.id)await sb.from("site_config").update(row).eq("id",cache.config.id);else await sb.from("site_config").insert(row);toast("Settings published");load()};
function preview(sel,url){$(sel).innerHTML=url?`<img src="${url}" alt="Preview">`:"<span>No photo selected</span>"}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function renderAll(){renderDashboard();renderMedia();renderHero();renderProducts();renderStories();renderDaily();renderSettings()}

$("#loginForm").onsubmit=async e=>{e.preventDefault();if(!requireSB())return;$("#loginError").textContent="";const {error}=await sb.auth.signInWithPassword({email:$("#email").value,password:$("#password").value});if(error){$("#loginError").textContent=error.message;return}await checkSession()};
$("#logout").onclick=async()=>{await sb.auth.signOut();location.reload()};
async function checkSession(){if(!sb){$("#login").hidden=false;return}const {data}=await sb.auth.getSession();if(!data.session){$("#login").hidden=false;$("#app").hidden=true;return}const {data:a}=await sb.from("admin_users").select("user_id").eq("user_id",data.session.user.id).maybeSingle();if(!a){await sb.auth.signOut();$("#loginError").textContent="This account is not a bakery administrator.";return}$("#login").hidden=true;$("#app").hidden=false;load()}
checkSession();
})();