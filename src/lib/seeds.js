// Curated discovery seeds — pre-resolved with iTunes catalog data (album_id + art)
// so the Discover page never needs runtime iTunes lookups for these albums.
// Any entry without album_id will fall back to resolveSeed() at render time.

const POOL_DATA = [
  // [title, artist, genre, album_id, artist_id, art, year]
  ["To Pimp a Butterfly","Kendrick Lamar","Hip-Hop","1440871877","368183298","https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b5/a6/91/b5a69171-5232-3d5b-9c15-8963802f83dd/15UMGIM15814.rgb.jpg/600x600bb.jpg","2015"],
  ["Illmatic","Nas","Hip-Hop","856131729","35307","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b9/eb/cc/b9ebccbc-5ba4-2cdb-5332-b065739abd9a/886444567619.jpg/600x600bb.jpg","1994"],
  ["Madvillainy","Madvillain","Hip-Hop","41655332","27519442","https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/18/b4/9a/18b49ad5-6407-7169-27f4-d1c8bcb5504b/s05.nqwebndj.jpg/600x600bb.jpg","2004"],
  ["My Beautiful Dark Twisted Fantasy","Kanye West","Hip-Hop","1445865909","2715720","https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/37/da/7c/37da7cc5-2b6f-9bb8-30ba-8a8c3be3e16a/00602527584973.rgb.jpg/600x600bb.jpg","2010"],
  ["good kid, m.A.A.d city","Kendrick Lamar","Hip-Hop","1440860389","368183298","https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/36/86/ec/3686ec99-dec4-0a01-8b74-2d8a9a0263a7/12UMGIM52988.rgb.jpg/600x600bb.jpg","2012"],
  ["Aquemini","OutKast","Hip-Hop","1536669507","289550","https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0e/48/dd/0e48dd9a-07c9-46de-a838-b4ddb4e508a7/886448814191.jpg/600x600bb.jpg","1998"],
  ["OK Computer","Radiohead","Rock","1097861387","657515","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/07/60/ba/0760ba0f-148c-b18f-d0ff-169ee96f3af5/634904078164.png/600x600bb.jpg","1997"],
  ["The Dark Side of the Moon","Pink Floyd","Rock","1065975633","487143","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/17/ec/3e17ec6d-f980-c64f-19e0-a6fd8bbf0c10/886445635850.jpg/600x600bb.jpg","1979"],
  ["Abbey Road","The Beatles","Rock","1474815798","136975","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/48/53/43/485343e3-dd6a-0034-faec-f4b6403f8108/13UMGIM63890.rgb.jpg/600x600bb.jpg","1969"],
  ["Revolver","The Beatles","Rock","1642995371","136975","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/f4/3a/97f43ab4-9fdf-7a41-e430-7c6c313f3883/13UMGIM63887.rgb.jpg/600x600bb.jpg","1966"],
  ["Nevermind","Nirvana","Rock","1440892370","112018","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/46/24/33/462433f9-ee74-2d60-4538-859826a7bed7/00720642472729.rgb.jpg/600x600bb.jpg","1994"],
  ["In Rainbows","Radiohead","Rock","1109714933","657515","https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dd/50/c7/dd50c790-99ac-d3d0-5ab8-e3891fb8fd52/634904032463.png/600x600bb.jpg","2007"],
  ["Thriller","Michael Jackson","Pop","269572838","32940","https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg","1982"],
  ["Purple Rain","Prince","Pop","1746833068","659587","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/00/17/f2/0017f24f-e580-b77a-71a8-1bc7b75881bf/603497822065.jpg/600x600bb.jpg","1984"],
  ["1989","Taylor Swift","Pop","1713845538","159260351","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8e/35/6c/8e356cc2-0be4-b83b-d29e-b578623df2ac/23UM1IM34052.rgb.jpg/600x600bb.jpg","2023"],
  ["Back to Black","Amy Winehouse","Pop","1440856219","13125609","https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/cf/3f/09/cf3f0994-980d-d8ed-088d-ae89af256b73/15UMGIM24224.rgb.jpg/600x600bb.jpg","2006"],
  ["Future Nostalgia","Dua Lipa","Pop","1489975831","1031397873","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e9/c5/a8/e9c5a8a0-d698-137b-2e85-cf3a8d9548f8/190295303372.jpg/600x600bb.jpg","2019"],
  ["BRAT","Charli xcx","Pop","1255207566","432942256","https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/f1/63/74/f1637468-35dd-89f4-eee4-62dafeb74646/190295767228.jpg/600x600bb.jpg","2017"],
  ["What's Going On","Marvin Gaye","R&B & Soul","1538081586","127329","https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/76/36/2d/76362d74-cb7a-8ef9-104e-cde1d858e9a9/20UMGIM95279.rgb.jpg/600x600bb.jpg","1971"],
  ["Songs in the Key of Life","Stevie Wonder","R&B & Soul","1440788438","46726","https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/eb/1f/12/eb1f12ec-474c-63aa-43af-09282f423b9d/00602537004737.rgb.jpg/600x600bb.jpg","1976"],
  ["Channel Orange","Frank Ocean","R&B & Soul","1349524897","442122051","https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/42/62/50/426250f9-7e39-f907-687c-442caa436636/dj.nhptxziz.jpg/600x600bb.jpg","2018"],
  ["Blonde","Frank Ocean","R&B & Soul","1445278500","442122051","https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/8d/76/23/8d76234b-5101-fa9b-58b3-5e17645d5b05/00602527744209.rgb.jpg/600x600bb.jpg","2011"],
  ["SOS","SZA","R&B & Soul","1658650093","605800394","https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/62/93/13/6293132e-20ff-67ab-3d1f-96bb6797a6ba/196589564955.jpg/600x600bb.jpg","2022"],
  ["Voodoo","D'Angelo","R&B & Soul","1443829916","640286","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e9/b9/9e/e9b99e73-58a5-1e31-f57c-b11e78419dcf/16UMGIM86249.rgb.jpg/600x600bb.jpg","2000"],
  ["Discovery","Daft Punk","Electronic","697194953","5468295","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/4a/77/fd4a77db-0ebc-d043-41a2-f32fa1bb0fb4/dj.qrikkdwj.jpg/600x600bb.jpg","2001"],
  ["Selected Ambient Works 85-92","Aphex Twin","Electronic","1668862636","39883194","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5f/b3/e0/5fb3e08d-c2cd-3da4-6ad7-c5dc61803683/cover.jpg/600x600bb.jpg","1992"],
  ["Random Access Memories","Daft Punk","Electronic","617154241","5468295","https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e8/43/5f/e8435ffa-b6b9-b171-40ab-4ff3959ab661/886443919266.jpg/600x600bb.jpg","2013"],
  ["Untrue","Burial","Electronic","893175779","468355684","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/9d/0f/1c/9d0f1c2b-2fae-d8ac-3920-ce9ec5bc85b5/7982.jpg/600x600bb.jpg","2007"],
  ["Music Has the Right to Children","Boards of Canada","Electronic","281116024","2989314","https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/b5/4c/c2/b54cc20d-03f5-f2c4-4a0d-9b51ad65af89/dj.txuslqgv.jpg/600x600bb.jpg","1998"],
  ["Immunity","Jon Hopkins","Electronic","1688995695","15040325","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/78/c7/d5/78c7d516-d9a7-0cb9-1fee-0b53dfc74d96/887830017664.png/600x600bb.jpg","2023"],
  ["Kind of Blue","Miles Davis","Jazz","268443092","44984","https://is1-ssl.mzstatic.com/image/thumb/Music/7f/9f/d6/mzi.vtnaewef.jpg/600x600bb.jpg","1959"],
  ["A Love Supreme","John Coltrane","Jazz","1440713018","120199","https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e5/24/aa/e524aacd-467b-66f3-8931-0fcd6750a4b9/08UMGIM07914.rgb.jpg/600x600bb.jpg","1965"],
  ["Mingus Ah Um","Charles Mingus","Jazz","315947000","478880","https://is1-ssl.mzstatic.com/image/thumb/Music/85/f3/ef/mzi.etlgbitd.jpg/600x600bb.jpg","1959"],
  ["Time Out","The Dave Brubeck Quartet","Jazz","316475425","20425617","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/39/da/45/39da45ea-0a55-8668-0a84-4017b45fb13e/dj.rzbgoyft.jpg/600x600bb.jpg","1959"],
  ["The Epic","Kamasi Washington","Jazz","975610456","154076564","https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/ee/f3/42/eef342b0-6024-1bb3-15db-426aa5ee1eb8/kw_1400.jpg/600x600bb.jpg","2015"],
  ["Blue Train","John Coltrane","Jazz","1468202477","120199","https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/6e/1a/13/6e1a134d-8f6f-d90f-b855-ea69436a2e8b/17UM1IM45370.rgb.jpg/600x600bb.jpg","1957"],
  ["Blue","Joni Mitchell","Folk & Country","1492263092","203373","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/00/a2/43/00a24363-cf69-bfd2-a26a-a042d57ab141/075992719926.jpg/600x600bb.jpg","1971"],
  ["Blood on the Tracks","Bob Dylan","Folk & Country","158320766","462006","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/34/6e/4d/346e4d1c-c9ef-cf7f-96d9-aad97286febb/074643323529.jpg/600x600bb.jpg","1975"],
  ["Pink Moon","Nick Drake","Folk & Country","1567147188","1285818","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/66/d5/9a/66d59a9f-c2d4-8da2-7053-ea2e97f0b7f7/21UMGIM38174.rgb.jpg/600x600bb.jpg","1972"],
  ["Carrie & Lowell","Sufjan Stevens","Folk & Country","1227779973","4273404","https://is1-ssl.mzstatic.com/image/thumb/Music91/v4/6b/20/6a/6b206ac1-e1b5-316d-334d-59df7b727fb6/656605613666.jpg/600x600bb.jpg","2017"],
  ["Golden Hour","Kacey Musgraves","Folk & Country","1440918116","466044182","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/61/45/e8/6145e88a-6a79-fab1-ad8f-5ffdcbf44a28/18UMGIM03879.rgb.jpg/600x600bb.jpg","2018"],
  ["folklore","Taylor Swift","Folk & Country","1528111535","159260351","https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/8c/ef/c2/8cefc23a-61b7-05ff-b52a-bb1e4922087c/20UMGIM64216.rgb.jpg/600x600bb.jpg","2020"],
  ["Master of Puppets","Metallica","Metal","1275551221","3996865","https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/ed/ee/7f/edee7f18-85b6-ebb4-0620-89cbe56fe205/858978005554.png/600x600bb.jpg","1986"],
  ["Paranoid","Black Sabbath","Metal","785232473","572505","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/27/91/be279120-2285-16c6-c7ba-9d6643d4a948/075992732727.jpg/600x600bb.jpg","1970"],
  ["Reign in Blood","Slayer","Metal",null,null,null,null],
  ["Rust in Peace","Megadeth","Metal","724648893","488289","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/df/fe/a7/dffea722-e8d7-b2ac-2b31-e207fb738b8e/13UABIM36806.rgb.jpg/600x600bb.jpg","1990"],
  ["Blackwater Park","Opeth","Metal","1562352313","3196120","https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/a9/f7/d8/a9f7d891-4464-e018-d6d6-6ab44cf77271/886449090662.jpg/600x600bb.jpg","2001"],
  ["Jane Doe","Converge","Metal","493658129","15405383","https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/8d/73/a9/8d73a92a-8383-b03c-acaa-f232cf09cf18/888880843210.jpg/600x600bb.jpg","2001"],
  ["In the Aeroplane Over the Sea","Neutral Milk Hotel","Indie & Alternative","1839077554","5611466","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/12/e3/5c/12e35c39-de5c-b501-3ef0-00f19fb3d513/56627.jpg/600x600bb.jpg","1998"],
  ["Funeral","Arcade Fire","Indie & Alternative","1249417623","475379","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/09/6e/2b096e8c-ae65-fc42-a4b1-19abb4100433/886446576442.jpg/600x600bb.jpg","2004"],
  ["Loveless","My Bloody Valentine","Indie & Alternative","1556924265","206711","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f9/7e/6b/f97e6b94-f307-ae7f-e94c-d74860a44350/887830016094.png/600x600bb.jpg","1991"],
  ["Is This It","The Strokes","Indie & Alternative","601140186","560289","https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/9c/ae/7a/9cae7a72-29ed-08aa-1b42-913776bbb6ec/886443855571.jpg/600x600bb.jpg","2013"],
  ["Sound of Silver","LCD Soundsystem","Indie & Alternative","742432549","29525428","https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fb/fe/a5/fbfea51a-0130-d557-c1f4-9e5e98b7bab8/094638511359.jpg/600x600bb.jpg","2007"],
  ["Punisher","Phoebe Bridgers","Indie & Alternative","1537676681","326516787","https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5a/5d/1f/5a5d1fde-7f6f-9997-3bca-d75f1e799464/656605154565.jpg/600x600bb.jpg","2020"],
];

const NEW_2026_DATA = [
  // [title, artist, album_id, artist_id, art, year]
  ["OCTANE","Don Toliver","1873328276","1237012992","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/00/c1/dd/00c1dd09-3f86-7288-01dc-63b9f4262f57/075679599377.jpg/600x600bb.jpg","2026"],
  ["Kehlani","Kehlani","1895059387","690126399","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ee/a9/73/eea973e3-0b43-973a-9a60-12f2a7d50c8f/075679591555.jpg/600x600bb.jpg","2026"],
  ["Iceman","Drake","6769649287","271256","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7f/39/61/7f396123-be56-bc11-eaab-976441808e58/26UMGIM63622.rgb.jpg/600x600bb.jpg","2026"],
  ["Songs About Us","Jason Aldean","1847440777","63684710","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/76/28/e7/7628e7b8-0268-f529-6ca8-d5bffb1f2d9e/4099964214482.jpg/600x600bb.jpg","2026"],
  ["Dandelion","Ella Langley","1895159736","1384373733","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/35/03/26350323-d656-4817-49e6-4d658af8363a/196874332917.jpg/600x600bb.jpg","2026"],
  ["Middle of Nowhere","Kacey Musgraves","6764160788","466044182","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f4/e9/ec/f4e9eca8-2919-ae12-f423-18b26cbb1cf4/26UMGIM51354.rgb.jpg/600x600bb.jpg","2026"],
  ["BULLY","Ye","1872771948","1714710847","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4c/78/0e/4c780ef8-f9cf-62f2-b956-2ceab8b81905/0692788731278_cover.jpg/600x600bb.jpg","2025"],
  ["WOR$T GIRL IN AMERICA","Slayyyter",null,null,null,"2026"],
  ["THIS MUSIC MAY CONTAIN HOPE.","RAYE","1871085677","261686","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/50/05/10/5005106d-bb8a-32db-1172-f18405cf4a46/820200038890.jpg/600x600bb.jpg","2026"],
  ["Sexistential","Robyn",null,null,null,"2026"],
  ["U","underscores","1879508534","1204838812","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8c/a4/b1/8ca4b15b-9ea9-b43a-0c1e-0748f0f3bb80/810090098739_Cover.jpg/600x600bb.jpg","2026"],
  ["The Way I Am","Luke Combs","1862634688","1013674869","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4c/b6/e5/4cb6e5b1-2db0-88c0-f025-b79cad3b8fab/196873832111.jpg/600x600bb.jpg","2026"],
  ["An Undying Love for a Burning World","Neurosis",null,null,null,"2026"],
  ["Girlfriend","Grace Ives",null,null,null,"2026"],
  ["Nothing's About to Happen to Me","Mitski",null,null,null,"2026"],
  ["Cloud 9","Megan Moroney","1880181535","1552469569","https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/6b/d8/9d/6bd89d56-4e31-f431-fb4c-5a81a6441f82/196874133101.jpg/600x600bb.jpg","2026"],
  ["The Fall-Off","J. Cole","1876341626","73705833","https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/31/56/a6/3156a612-c10c-7703-32b9-88a14efa3df0/26UMGIM17314.rgb.jpg/600x600bb.jpg","2026"],
  ["Don't Be Dumb","A$AP Rocky","1702941199","481488005","https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/64/8f/5f/648f5f68-3ffa-e33d-39d0-50210803074f/196871388221.jpg/600x600bb.jpg","2023"],
  ["With Heaven on Top","Zach Bryan","1643975591","1436413980","https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b4/e0/31/b4e03179-76e0-4c56-26e7-3637e84266b2/054391820549.jpg/600x600bb.jpg","2022"],
];

export const POOL = POOL_DATA.map((r, i) => ({
  id: "s" + i,
  title: r[0], artist: r[1], genre: r[2], cat: r[2],
  ...(r[3] ? { album_id: r[3], artist_id: r[4], art: r[5], year: r[6] } : {}),
}));

export const NEW_2026 = NEW_2026_DATA.map((r, i) => ({
  id: "n" + i,
  title: r[0], artist: r[1], year: r[5] || "2026", genre: "New Releases", cat: "New Releases",
  ...(r[2] ? { album_id: r[2], artist_id: r[3], art: r[4] } : {}),
}));

export const CATEGORIES = [
  { key: "New Releases", type: "recent", color: "#B5532A" },
  { key: "Hip-Hop", color: "#4A8DB7" }, { key: "Rock", color: "#2A3A86" }, { key: "Pop", color: "#9B5BA5" },
  { key: "R&B & Soul", color: "#7B2CBF" }, { key: "Electronic", color: "#1B998B" }, { key: "Jazz", color: "#9C6644" },
  { key: "Folk & Country", color: "#5A7D2C" }, { key: "Metal", color: "#34343A" }, { key: "Indie & Alternative", color: "#C8553D" },
];
export function catSeeds(c) {
  if (!c) return [];
  if (c.type === "recent") return NEW_2026;
  return POOL.filter(a => a.cat === c.key);
}
export const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
