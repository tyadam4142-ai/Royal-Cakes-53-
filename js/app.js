(() => {
"use strict";

const cfg = window.RC53_SUPABASE || {};
const fallback = window.RC53_DEFAULTS || {};
const hasSupabase = cfg.url && !cfg.url.includes("PASTE_") && cfg.publishableKey && !cfg.publishableKey.includes("PASTE_");
const sb = hasSupabase ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let data = {config:{...fallback,logoUrl:"assets/logo.png"},hero:[],products:[],stories:[],daily:null,gallery:[]};
let cart = JSON.parse(localStorage.getItem("rc53_cart") || "[]");
let heroIndex = 0, heroTimer, storyItems=[], storyIndex=0, storyTimer;

async function fetchData(){
  if(!sb) return;
  const [c,h,p,s,d,g] = await Promise.all([
    sb.from("site_config").select("*").limit(1).maybeSingle(),
    sb.from("hero_slides").select("*").eq("active",true).order("sort_order"),
    sb.from("products").select("*").eq("available",true).order("sort_order"),
    sb.from("stories").select("*").eq("active",true).order("sort_order"),
    sb.from("daily_cake").select("*").eq("active",true).order("updated_at",{ascending:false}).limit(1).maybeSingle(),
    sb.from("media_library").select("*").eq("published",true).order("sort_order").order("created_at",{ascending:false})
  ]);
  if(c.data) data.config={...data.config,...c.data};
  data.hero=h.data||[]; data.products=p.data||[]; data.stories=s.data||[]; data.daily=d.data||null; data.gallery=g.data||[];
}

function applyBrand(){
  document.title=data.config.bakery_name || fallback.bakeryName;
  $("#brandLogo").src=data.config.logo_url || "assets/logo.png";
  $("#brandLogo").onerror=()=>{$("#brandLogo").style.display="none";$(".brand-fallback").style.display="flex"};
}

function renderHero(){
  const slides=data.hero;
  const wrap=$("#heroSlides"), prog=$("#heroProgress");
  if(!slides.length){
    wrap.innerHTML='<div class="hero-slide fallback-slide active"></div>';
    $("#heroCounter").textContent="01 / 01";
    return;
  }
  wrap.innerHTML=slides.map((s,i)=>`<div class="hero-slide ${i===heroIndex?"active":""}" style="background-image:url('${esc(s.image_url)}')"></div>`).join("");
  prog.innerHTML=slides.map((_,i)=>`<button class="${i===heroIndex?"active":""}" data-i="${i}" aria-label="Slide ${i+1}"><i></i></button>`).join("");
  $("#heroEyebrow").textContent=slides[heroIndex].eyebrow||"HANDCRAFTED WITH LOVE";
  $("#heroTitle").innerHTML=esc(slides[heroIndex].title||"Every celebration deserves something royal.").replace(/\\n/g,"<br>");
  $("#heroDescription").textContent=slides[heroIndex].description||"Beautiful cakes and sweet creations, lovingly crafted for moments worth remembering.";
  $("#heroCounter").textContent=`${String(heroIndex+1).padStart(2,"0")} / ${String(slides.length).padStart(2,"0")}`;
  prog.querySelectorAll("button").forEach(b=>b.onclick=()=>{heroIndex=+b.dataset.i;renderHero();restartHero()});
}
function restartHero(){clearInterval(heroTimer); if(data.hero.length>1) heroTimer=setInterval(()=>{heroIndex=(heroIndex+1)%data.hero.length;renderHero()},5000)}
$("#heroPrev").onclick=()=>{if(data.hero.length){heroIndex=(heroIndex-1+data.hero.length)%data.hero.length;renderHero();restartHero()}};
$("#heroNext").onclick=()=>{if(data.hero.length){heroIndex=(heroIndex+1)%data.hero.length;renderHero();restartHero()}};

function renderDaily(){
  const d=data.daily;
  if(!d){$(".daily").style.display="none";return}
  $("#dailyTitle").textContent=d.title||"Cake of the Day";
  $("#dailySubtitle").textContent=d.description||"A fresh royal creation, specially selected for today.";
  $("#dailyLabel").textContent=d.price ? `${d.price} • TODAY'S SPECIAL` : "TODAY'S SPECIAL";
  const now=new Date(); $("#dailyDay").textContent=now.toLocaleDateString("en-IN",{weekday:"long"}).toUpperCase(); $("#dailyDate").textContent=now.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const photo=$("#dailyPhoto"); photo.style.backgroundImage=d.image_url?`url("${d.image_url}")`:""; photo.classList.toggle("has-image",!!d.image_url);
}
function renderStories(){
  const row=$("#storyRow"); storyItems=data.stories||[];
  row.innerHTML=storyItems.length?storyItems.map((s,i)=>`<button class="story-card" data-i="${i}"><span class="story-ring"><img src="${esc(s.image_url)}" alt=""></span><b>${esc(s.title||"Royal Story")}</b></button>`).join(""):'<div class="empty">No stories yet.</div>';
  row.querySelectorAll(".story-card").forEach(b=>b.onclick=()=>openStory(+b.dataset.i));
}
function openStory(i){storyIndex=i;$("#storyViewer").classList.add("open");renderStory();clearInterval(storyTimer);storyTimer=setInterval(()=>nextStory(),4000)}
function closeStory(){$("#storyViewer").classList.remove("open");clearInterval(storyTimer)}
function renderStory(){
  const s=storyItems[storyIndex]; if(!s)return;
  $("#storyImage").src=s.image_url; $("#storyName").textContent=s.title||"Royal Story"; $("#storyText").textContent=s.caption||"";
  $("#storyBars").innerHTML=storyItems.map((_,i)=>`<i class="${i===storyIndex?"active":""}"><b></b></i>`).join("");
}
function nextStory(){if(!storyItems.length)return;storyIndex=(storyIndex+1)%storyItems.length;renderStory()}
function prevStory(){if(!storyItems.length)return;storyIndex=(storyIndex-1+storyItems.length)%storyItems.length;renderStory()}
$("#closeStory").onclick=closeStory; $("#storyNext").onclick=()=>{nextStory();clearInterval(storyTimer);storyTimer=setInterval(nextStory,4000)}; $("#storyPrev").onclick=()=>{prevStory();clearInterval(storyTimer);storyTimer=setInterval(nextStory,4000)};

let activeCat="All";
function renderProducts(){
  const cats=["All",...new Set(data.products.map(p=>p.category).filter(Boolean))];
  $("#filters").innerHTML=cats.map(c=>`<button class="${c===activeCat?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  $("#filters").querySelectorAll("button").forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;renderProducts()});
  const list=data.products.filter(p=>activeCat==="All"||p.category===activeCat), grid=$("#productGrid");
  $("#emptyProducts").style.display=list.length?"none":"block";
  grid.innerHTML=list.map(p=>`<article class="product"><div class="product-photo">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:'<span>ROYAL<br>CAKES 53</span>'}<button class="add" data-id="${p.id}">+</button></div><div class="product-body"><span>${esc(p.category||"Bakery")}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||"Freshly crafted for you.")}</p><div><strong>${data.config.currency||"₹"}${Number(p.price||0).toLocaleString("en-IN")}</strong><button class="mini-add" data-id="${p.id}">Add to cart</button></div></div></article>`).join("");
  grid.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>addCart(b.dataset.id));
}
function addCart(id){const p=data.products.find(x=>String(x.id)===String(id));if(!p)return;const hit=cart.find(x=>String(x.id)===String(id));hit?hit.qty++:cart.push({id:p.id,name:p.name,price:Number(p.price||0),qty:1});saveCart();showToast(`${p.name} added to cart`)}
function saveCart(){localStorage.setItem("rc53_cart",JSON.stringify(cart));renderCart()}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-item"><div><b>${esc(x.name)}</b><small>${data.config.currency||"₹"}${x.price} × ${x.qty}</small></div><div><button data-act="minus" data-id="${x.id}">−</button><b>${x.qty}</b><button data-act="plus" data-id="${x.id}">+</button></div></div>`).join(""):'<div class="empty">Your cart is waiting for something delicious.</div>';
  const total=cart.reduce((a,x)=>a+x.price*x.qty,0);$("#cartTotal").textContent=`${data.config.currency||"₹"}${total.toLocaleString("en-IN")}`;
  $("#cartItems").querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>{const x=cart.find(v=>String(v.id)===String(b.dataset.id));if(!x)return;b.dataset.act==="plus"?x.qty++:x.qty--;if(x.qty<=0)cart=cart.filter(v=>String(v.id)!==String(b.dataset.id));saveCart()});
}
function openCart(){$("#cart").classList.add("open");$("#cartOverlay").classList.add("open")}
function closeCart(){$("#cart").classList.remove("open");$("#cartOverlay").classList.remove("open")}
$("#cartBtn").onclick=openCart;$("#mobileCartBtn").onclick=openCart;$("#closeCart").onclick=closeCart;$("#cartOverlay").onclick=closeCart;
$("#whatsappOrder").onclick=()=>{
 if(!cart.length){showToast("Add something to your cart first");return}
 const lines=cart.map(x=>`• ${x.name} × ${x.qty} — ${data.config.currency||"₹"}${x.price*x.qty}`).join("\n");
 const total=cart.reduce((a,x)=>a+x.price*x.qty,0);
 const msg=`Hello Royal Cakes 53! I would like to place an order:\n\n${lines}\n\nTotal: ${data.config.currency||"₹"}${total}\n\nPlease confirm availability.`;
 window.open(`https://wa.me/${data.config.whatsapp_number||fallback.whatsappNumber}?text=${encodeURIComponent(msg)}`,"_blank");
};

function renderGallery(){
 const g=$("#galleryGrid"), items=data.gallery||[];
 $("#emptyGallery").style.display=items.length?"none":"block";
 g.innerHTML=items.map((m,i)=>`<button class="gallery-item ${i%5===0?"wide":""}" data-i="${i}"><img src="${esc(m.image_url)}" alt="${esc(m.caption||"Royal Cakes 53")}"><span>${esc(m.caption||"Royal Cakes 53")}</span></button>`).join("");
 g.querySelectorAll("button").forEach(b=>b.onclick=()=>{const m=items[+b.dataset.i];window.open(m.image_url,"_blank")});
}
function showToast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
$("#hamburger").onclick=()=>$("#mobileNav").classList.toggle("open");
document.querySelectorAll(".mobile-nav a").forEach(a=>a.onclick=()=>$("#mobileNav").classList.remove("open"));
window.addEventListener("scroll",()=>$("#header").classList.toggle("scrolled",scrollY>30),{passive:true});

(async()=>{
 try{await fetchData()}catch(e){console.warn(e)}
 applyBrand();renderHero();restartHero();renderDaily();renderStories();renderProducts();renderGallery();renderCart();
 setTimeout(()=>$("#preloader").classList.add("done"),650);
})();
})();