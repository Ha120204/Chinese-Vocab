import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('licenses',{recursive:true});
for(const [family,file] of [['notoserifsc','Noto-Serif-SC-OFL.txt'],['bevietnampro','Be-Vietnam-Pro-OFL.txt']]){
  const url=`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`;
  const response=await fetch(url);if(!response.ok)throw new Error(`${family}: HTTP ${response.status}`);
  await writeFile(`licenses/${file}`,await response.text());
  console.log(`Saved ${file}`);
}
