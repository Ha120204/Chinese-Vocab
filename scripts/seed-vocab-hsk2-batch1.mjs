import { mkdir, writeFile } from 'node:fs/promises';

// Headwords, pinyin and syllabus numbers: HSK 考试大纲 (2025-11),
// HSK（二级）词汇, numbers 301–500. Meanings and examples are original.
// https://hsk.cn-bj.ufileos.com/3.0/新版HSK考试大纲1219.pdf
const rows = [
  // Day 1 · conversation
  [301,'啊','a','trợ từ cuối câu: cảm thán, nhấn mạnh, thúc giục (nhé, nhỉ, quá, đi)','Giao tiếp','好啊！','Hǎo a!','Được đấy!','','Khi đọc nối, 啊 có thể biến âm thành ya, wa hoặc na tùy âm đứng trước.'],
  [313,'不好意思','bù hǎoyìsi','xin lỗi; ngại quá','Giao tiếp','不好意思，我没有看见你。','Bù hǎoyìsi, wǒ méiyǒu kànjiàn nǐ.','Xin lỗi, tôi không nhìn thấy bạn.',''],
  [305,'帮','bāng','giúp','Giao tiếp','你帮我看一下。','Nǐ bāng wǒ kàn yíxià.','Bạn xem giúp tôi một chút.',''],
  [306,'帮忙','bāngmáng','giúp đỡ','Giao tiếp','请你帮忙。','Qǐng nǐ bāngmáng.','Nhờ bạn giúp một tay.',''],
  [343,'告诉','gàosu','nói cho biết','Giao tiếp','请告诉我你的名字。','Qǐng gàosu wǒ nǐ de míngzi.','Hãy cho tôi biết tên bạn.',''],
  [369,'介绍','jièshào','giới thiệu','Giao tiếp','我来介绍我的老师。','Wǒ lái jièshào wǒ de lǎoshī.','Để tôi giới thiệu thầy cô của tôi.',''],
  [337,'懂','dǒng','hiểu','Giao tiếp','你听懂了吗？','Nǐ tīng dǒng le ma?','Bạn nghe hiểu chưa?',''],
  [365,'记得','jìde','nhớ','Giao tiếp','我记得你的名字。','Wǒ jìde nǐ de míngzi.','Tôi nhớ tên bạn.',''],
  [452,'忘','wàng','quên','Giao tiếp','我忘了他的名字。','Wǒ wàng le tā de míngzi.','Tôi quên tên anh ấy rồi.',''],
  [472,'一起','yìqǐ','cùng nhau','Giao tiếp','我们一起去学校。','Wǒmen yìqǐ qù xuéxiào.','Chúng ta cùng đến trường.',''],
  // Day 2 · school
  [304,'班','bān','lớp học','Học tập','我们班有十个学生。','Wǒmen bān yǒu shí ge xuéshēng.','Lớp chúng tôi có mười học sinh.',''],
  [308,'本子','běnzi','quyển vở','Học tập','这个本子是我的。','Zhège běnzi shì wǒ de.','Quyển vở này là của tôi.',''],
  [310,'笔','bǐ','bút','Học tập','我的笔在桌子上。','Wǒ de bǐ zài zhuōzi shàng.','Bút của tôi ở trên bàn.',''],
  [322,'词','cí','từ ngữ','Học tập','这个词是什么意思？','Zhège cí shì shénme yìsi?','Từ này có nghĩa là gì?',''],
  [367,'教','jiāo','dạy','Học tập','老师教我们汉语。','Lǎoshī jiāo wǒmen Hànyǔ.','Thầy cô dạy chúng tôi tiếng Trung.',''],
  [368,'教室','jiàoshì','phòng học','Học tập','学生在教室里。','Xuéshēng zài jiàoshì lǐ.','Học sinh ở trong phòng học.',''],
  [378,'开始','kāishǐ','bắt đầu','Học tập','八点开始上课。','Bā diǎn kāishǐ shàngkè.','Tám giờ bắt đầu vào học.',''],
  [379,'开学','kāixué','khai giảng; bắt đầu kỳ học','Học tập','明天开学。','Míngtiān kāixué.','Ngày mai bắt đầu kỳ học.',''],
  [380,'考','kǎo','thi; kiểm tra','Học tập','我明天考汉语。','Wǒ míngtiān kǎo Hànyǔ.','Ngày mai tôi thi môn tiếng Trung.',''],
  [381,'考试','kǎoshì','kỳ thi; thi','Học tập','今天我有考试。','Jīntiān wǒ yǒu kǎoshì.','Hôm nay tôi có bài thi.',''],
  // Day 3 · getting around
  [315,'车站','chēzhàn','bến xe; nhà ga','Đi lại','车站在前面。','Chēzhàn zài qiánmiàn.','Bến xe ở phía trước.',''],
  [335,'地铁','dìtiě','tàu điện ngầm','Đi lại','我坐地铁去学校。','Wǒ zuò dìtiě qù xuéxiào.','Tôi đi tàu điện ngầm đến trường.',''],
  [346,'公交车','gōngjiāochē','xe buýt','Đi lại','他坐公交车来。','Tā zuò gōngjiāochē lái.','Anh ấy đến bằng xe buýt.',''],
  [363,'机场','jīchǎng','sân bay','Đi lại','机场离这里很远。','Jīchǎng lí zhèlǐ hěn yuǎn.','Sân bay cách đây rất xa.',''],
  [364,'机票','jīpiào','vé máy bay','Đi lại','我买了机票。','Wǒ mǎi le jīpiào.','Tôi đã mua vé máy bay.',''],
  [373,'近','jìn','gần','Đi lại','学校离我家很近。','Xuéxiào lí wǒ jiā hěn jìn.','Trường ở rất gần nhà tôi.',''],
  [389,'离','lí','cách (một khoảng)','Đi lại','医院离这里很近。','Yīyuàn lí zhèlǐ hěn jìn.','Bệnh viện cách đây rất gần.',''],
  [391,'楼','lóu','tòa nhà; tầng','Đi lại','我家在二楼。','Wǒ jiā zài èr lóu.','Nhà tôi ở tầng hai.',''],
  [392,'路','lù','đường','Đi lại','这条路很长。','Zhè tiáo lù hěn cháng.','Con đường này rất dài.',''],
  [401,'门口','ménkǒu','cửa ra vào; trước cửa','Đi lại','我在学校门口等你。','Wǒ zài xuéxiào ménkǒu děng nǐ.','Tôi đợi bạn ở cổng trường.',''],
  // Day 4 · family and people
  [409,'奶奶','nǎinai','bà nội','Gia đình','奶奶在家做饭。','Nǎinai zài jiā zuò fàn.','Bà nội nấu cơm ở nhà.',''],
  [470,'爷爷','yéye','ông nội','Gia đình','爷爷喜欢喝茶。','Yéye xǐhuan hē chá.','Ông nội thích uống trà.',''],
  [410,'男孩儿','nánháir','bé trai; cậu bé','Gia đình','那个男孩儿是我弟弟。','Nàge nánháir shì wǒ dìdi.','Cậu bé kia là em trai tôi.',''],
  [412,'女孩儿','nǚháir','bé gái; cô bé','Gia đình','这个女孩儿是我妹妹。','Zhège nǚháir shì wǒ mèimei.','Cô bé này là em gái tôi.',''],
  [417,'妻子','qīzi','vợ','Gia đình','他的妻子是老师。','Tā de qīzi shì lǎoshī.','Vợ anh ấy là giáo viên.',''],
  [487,'丈夫','zhàngfu','chồng','Gia đình','她的丈夫是医生。','Tā de zhàngfu shì yīshēng.','Chồng cô ấy là bác sĩ.',''],
  [430,'生日','shēngrì','sinh nhật','Gia đình','今天是妈妈的生日。','Jīntiān shì māma de shēngrì.','Hôm nay là sinh nhật mẹ.',''],
  [437,'送','sòng','tặng; đưa tiễn','Gia đình','我送你一本书。','Wǒ sòng nǐ yì běn shū.','Tôi tặng bạn một quyển sách.',''],
  [302,'爱好','àihào','sở thích','Gia đình','我的爱好是看书。','Wǒ de àihào shì kàn shū.','Sở thích của tôi là đọc sách.',''],
  [344,'个子','gèzi','vóc dáng; chiều cao','Gia đình','我哥哥个子很高。','Wǒ gēge gèzi hěn gāo.','Anh trai tôi rất cao.',''],
  // Day 5 · food and colours
  [339,'饭馆','fànguǎn','quán ăn; nhà hàng','Ăn uống','我们去饭馆吃饭。','Wǒmen qù fànguǎn chī fàn.','Chúng ta đến quán ăn dùng bữa.',''],
  [354,'红茶','hóngchá','trà đen (hồng trà)','Ăn uống','妈妈喜欢喝红茶。','Māma xǐhuan hē hóngchá.','Mẹ thích uống trà đen.',''],
  [395,'绿茶','lǜchá','trà xanh','Ăn uống','我不喜欢喝绿茶。','Wǒ bù xǐhuan hē lǜchá.','Tôi không thích uống trà xanh.',''],
  [408,'奶茶','nǎichá','trà sữa','Ăn uống','我想喝奶茶。','Wǒ xiǎng hē nǎichá.','Tôi muốn uống trà sữa.',''],
  [423,'肉','ròu','thịt','Ăn uống','我今天不吃肉。','Wǒ jīntiān bù chī ròu.','Hôm nay tôi không ăn thịt.',''],
  [483,'鱼','yú','cá','Ăn uống','这条鱼很大。','Zhè tiáo yú hěn dà.','Con cá này rất to.',''],
  [303,'白色','báisè','màu trắng','Màu sắc','我喜欢白色的衣服。','Wǒ xǐhuan báisè de yīfu.','Tôi thích quần áo màu trắng.',''],
  [353,'黑色','hēisè','màu đen','Màu sắc','他的车是黑色的。','Tā de chē shì hēisè de.','Xe của anh ấy màu đen.',''],
  [355,'红色','hóngsè','màu đỏ','Màu sắc','这个包是红色的。','Zhège bāo shì hóngsè de.','Chiếc túi này màu đỏ.',''],
  [396,'绿色','lǜsè','màu xanh lá','Màu sắc','我喜欢绿色。','Wǒ xǐhuan lǜsè.','Tôi thích màu xanh lá.',''],
  // Day 6 · daily life and health
  [321,'床','chuáng','giường','Sinh hoạt','我的床在这里。','Wǒ de chuáng zài zhèlǐ.','Giường của tôi ở đây.',''],
  [429,'身体','shēntǐ','cơ thể; sức khỏe','Sức khỏe','他的身体很好。','Tā de shēntǐ hěn hǎo.','Sức khỏe anh ấy rất tốt.',''],
  [436,'舒服','shūfu','dễ chịu; thoải mái','Sức khỏe','我现在很舒服。','Wǒ xiànzài hěn shūfu.','Bây giờ tôi thấy rất dễ chịu.',''],
  [440,'疼','téng','đau','Sức khỏe','我的手很疼。','Wǒ de shǒu hěn téng.','Tay tôi rất đau.',''],
  [468,'药','yào','thuốc','Sức khỏe','我今天吃药。','Wǒ jīntiān chī yào.','Hôm nay tôi uống thuốc.',''],
  [469,'药店','yàodiàn','hiệu thuốc','Sức khỏe','药店在医院旁边。','Yàodiàn zài yīyuàn pángbiān.','Hiệu thuốc ở cạnh bệnh viện.',''],
  [414,'跑','pǎo','chạy','Vận động','他跑得很快。','Tā pǎo de hěn kuài.','Anh ấy chạy rất nhanh.',''],
  [415,'跑步','pǎobù','chạy bộ','Vận động','我每天早上跑步。','Wǒ měitiān zǎoshang pǎobù.','Tôi chạy bộ mỗi sáng.',''],
  [485,'运动','yùndòng','vận động; tập thể dục','Vận động','我喜欢运动。','Wǒ xǐhuan yùndòng.','Tôi thích vận động.',''],
  [456,'洗','xǐ','rửa; giặt','Sinh hoạt','我洗手。','Wǒ xǐ shǒu.','Tôi rửa tay.',''],
];

if (rows.length !== 60) throw new Error(`Expected 60 entries, got ${rows.length}`);
const numbers = new Set();
for (const row of rows) {
  if (row[0] < 301 || row[0] > 500 || numbers.has(row[0])) throw new Error(`Invalid or duplicate syllabusNo: ${row[0]}`);
  numbers.add(row[0]);
}
const words = rows.map(([syllabusNo,hanzi,pinyin,meaningVi,topic,hanziExample,pinyinExample,translationVi,,note], index) => ({
  id:`hsk2-${syllabusNo}`, level:2, order:index+1, syllabusNo, hanzi, pinyin, meaningVi, topic,
  example:{hanzi:hanziExample,pinyin:pinyinExample,translationVi}, ...(note ? { note } : {}), reviewed:true,
}));
const csvValue = value => `"${String(value).replaceAll('"','""')}"`;
const csv = ['Thứ tự học,syllabusNo,Hán,Pinyin,Nghĩa Việt,Câu ví dụ Hán,Pinyin câu ví dụ,Dịch câu ví dụ,Cần xem,Ghi chú',
  ...rows.map((row,index) => [index+1,row[0],row[1],row[2],row[3],row[5],row[6],row[7],row[8],row[9]??''].map(csvValue).join(','))].join('\r\n')+'\r\n';
await mkdir('data/vocab',{recursive:true});
await mkdir('review',{recursive:true});
await writeFile('data/vocab/hsk2-batch1.json',JSON.stringify(words,null,2)+'\n');
await writeFile('review/hsk2-batch1.csv','\ufeff'+csv);
console.log(`Wrote ${words.length} reviewed HSK2 words and CSV`);
