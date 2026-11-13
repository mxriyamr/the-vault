import {firebaseConfig} from "./firebase-config.js";
if(firebaseConfig.apiKey&&!firebaseConfig.apiKey.startsWith("PASTE")){
 try{
  const B="https://www.gstatic.com/firebasejs/10.12.2/";
  const {initializeApp}=await import(B+"firebase-app.js");
  const {getAuth,signInAnonymously}=await import(B+"firebase-auth.js");
  const {getFirestore,collection,addDoc,updateDoc,deleteDoc,doc,onSnapshot,query,orderBy}=await import(B+"firebase-firestore.js");
  const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
  await signInAnonymously(auth);
  const col=collection(db,"links"),me=auth.currentUser.uid,by=document.getElementById("by");
  try{by.value=localStorage.getItem("linkstash.name")||""}catch(e){}
  by.hidden=false;
  const saved=()=>{try{return localStorage.getItem("linkstash.name")||""}catch(e){return ""}};
  const name=()=>{const v=by.value.trim()||saved();if(v){try{localStorage.setItem("linkstash.name",v)}catch(e){}}return v};
  document.getElementById("f").addEventListener("reset",()=>setTimeout(()=>{by.value=saved()},0));
  setCloud({
   add:o=>addDoc(col,{...o,uid:me,by:name(),added:Date.now()}),
   update:(id,o)=>updateDoc(doc(db,"links",id),o),
   del:id=>deleteDoc(doc(db,"links",id))
  });
  let first=true;const SEEN="vault.seen";
  const stamp=()=>{try{localStorage.setItem(SEEN,String(Date.now()))}catch(e){}};
  onSnapshot(query(col,orderBy("added","desc")),s=>{
   setItems(s.docs.map(d=>{const x=d.data();return {title:"",note:"",tags:[],...x,cat:(CATS[x.cat]?x.cat:"activity"),id:d.id,mine:x.uid===me}}));
   if(first){first=false;let seen=0;try{seen=Number(localStorage.getItem(SEEN))||0}catch(e){}
    const n=s.docs.filter(d=>{const x=d.data();return seen&&x.added>seen&&x.uid!==me}).length;
    if(n&&window.vaultWelcome)window.vaultWelcome(n);
   }else{
    s.docChanges().forEach(ch=>{const x=ch.doc.data();if(ch.type==="added"&&!ch.doc.metadata.hasPendingWrites&&x.uid!==me&&window.vaultNotify)window.vaultNotify({...x,id:ch.doc.id})});
   }
   stamp();
  });
 }catch(e){console.error("Shared mode failed, using this device only",e)}
}
