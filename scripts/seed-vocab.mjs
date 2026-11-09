import { mkdir, writeFile } from 'node:fs/promises';

// Teaching order is authored for this site. syllabusNo and readings are checked
// against 新版HSK考试大纲 (2025-11), HSK（一级）词汇, entries 1–300.
const rows = [
  [147,'你好','nǐ hǎo','xin chào','Giao tiếp','你好，我是林。','Nǐ hǎo, wǒ shì Lín.','Chào bạn, tôi là Lâm.'],
  [221,'我','wǒ','tôi','Giao tiếp','我是学生。','Wǒ shì xuéshēng.','Tôi là học sinh.'],
  [146,'你','nǐ','bạn','Giao tiếp','你好吗？','Nǐ hǎo ma?','Bạn có khỏe không?'],
  [200,'他','tā','anh ấy','Giao tiếp','他是我的朋友。','Tā shì wǒ de péngyou.','Anh ấy là bạn của tôi.'],
  [202,'她','tā','cô ấy','Giao tiếp','她是老师。','Tā shì lǎoshī.','Cô ấy là giáo viên.'],
  [188,'是','shì','là','Giao tiếp','我是越南人。','Wǒ shì Yuènán rén.','Tôi là người Việt Nam.'],
  [115,'吗','ma','trợ từ dùng để hỏi','Giao tiếp','你是学生吗？','Nǐ shì xuéshēng ma?','Bạn là học sinh phải không?'],
  [13,'不','bù','không','Giao tiếp','我不喝茶。','Wǒ bù hē chá.','Tôi không uống trà.'],
  [79,'很','hěn','rất','Giao tiếp','今天很热。','Jīntiān hěn rè.','Hôm nay rất nóng.'],
  [71,'好','hǎo','tốt; khỏe','Giao tiếp','我的朋友很好。','Wǒ de péngyou hěn hǎo.','Bạn của tôi rất tốt.'],
  [170,'人','rén','người','Gia đình','这里有三个人。','Zhèlǐ yǒu sān ge rén.','Ở đây có ba người.'],
  [86,'家','jiā','nhà; gia đình','Gia đình','我想回家。','Wǒ xiǎng huí jiā.','Tôi muốn về nhà.'],
  [87,'家人','jiārén','người nhà','Gia đình','我的家人都很好。','Wǒ de jiārén dōu hěn hǎo.','Người nhà tôi đều khỏe.'],
  [3,'爸爸','bàba','bố; ba','Gia đình','爸爸在家。','Bàba zài jiā.','Bố ở nhà.'],
  [114,'妈妈','māma','mẹ','Gia đình','妈妈喜欢喝茶。','Māma xǐhuan hē chá.','Mẹ thích uống trà.'],
  [59,'哥哥','gēge','anh trai','Gia đình','哥哥在学校。','Gēge zài xuéxiào.','Anh trai ở trường.'],
  [32,'弟弟','dìdi','em trai','Gia đình','弟弟今年六岁。','Dìdi jīnnián liù suì.','Em trai năm nay sáu tuổi.'],
  [92,'姐姐','jiějie','chị gái','Gia đình','姐姐会写汉字。','Jiějie huì xiě Hànzì.','Chị gái biết viết chữ Hán.'],
  [123,'妹妹','mèimei','em gái','Gia đình','妹妹喜欢苹果。','Mèimei xǐhuan píngguǒ.','Em gái thích táo.'],
  [156,'朋友','péngyou','bạn bè','Gia đình','他是我的朋友。','Tā shì wǒ de péngyou.','Anh ấy là bạn của tôi.'],
  [254,'一','yī','một','Con số','我有一本书。','Wǒ yǒu yì běn shū.','Tôi có một quyển sách.'],
  [49,'二','èr','hai','Con số','今天是二月二日。','Jīntiān shì èr yuè èr rì.','Hôm nay là ngày hai tháng hai.'],
  [173,'三','sān','ba','Con số','桌上有三个苹果。','Zhuō shang yǒu sān ge píngguǒ.','Trên bàn có ba quả táo.'],
  [198,'四','sì','bốn','Con số','我们家有四个人。','Wǒmen jiā yǒu sì ge rén.','Nhà chúng tôi có bốn người.'],
  [223,'五','wǔ','năm','Con số','现在是五点。','Xiànzài shì wǔ diǎn.','Bây giờ là năm giờ.'],
  [113,'六','liù','sáu','Con số','我买了六个包子。','Wǒ mǎi le liù ge bāozi.','Tôi đã mua sáu chiếc bánh bao.'],
  [160,'七','qī','bảy','Con số','一周有七天。','Yì zhōu yǒu qī tiān.','Một tuần có bảy ngày.'],
  [2,'八','bā','tám','Con số','我八点去学校。','Wǒ bā diǎn qù xuéxiào.','Tôi đi học lúc tám giờ.'],
  [95,'九','jiǔ','chín','Con số','她九岁了。','Tā jiǔ suì le.','Cô ấy chín tuổi rồi.'],
  [184,'十','shí','mười','Con số','这本书有十页。','Zhè běn shū yǒu shí yè.','Quyển sách này có mười trang.'],
  [94,'今天','jīntiān','hôm nay','Thời gian','今天我学习汉语。','Jīntiān wǒ xuéxí Hànyǔ.','Hôm nay tôi học tiếng Trung.'],
  [129,'明天','míngtiān','ngày mai','Thời gian','明天我去学校。','Míngtiān wǒ qù xuéxiào.','Ngày mai tôi đến trường.'],
  [297,'昨天','zuótiān','hôm qua','Thời gian','昨天我在家。','Zuótiān wǒ zài jiā.','Hôm qua tôi ở nhà.'],
  [232,'现在','xiànzài','bây giờ','Thời gian','现在是上午九点。','Xiànzài shì shàngwǔ jiǔ diǎn.','Bây giờ là chín giờ sáng.'],
  [275,'早上','zǎoshang','sáng sớm','Thời gian','早上我喝水。','Zǎoshang wǒ hē shuǐ.','Buổi sáng tôi uống nước.'],
  [178,'上午','shàngwǔ','buổi sáng','Thời gian','上午我们有汉语课。','Shàngwǔ wǒmen yǒu Hànyǔ kè.','Buổi sáng chúng tôi có tiết tiếng Trung.'],
  [291,'中午','zhōngwǔ','buổi trưa','Thời gian','中午我吃米饭。','Zhōngwǔ wǒ chī mǐfàn.','Buổi trưa tôi ăn cơm.'],
  [230,'下午','xiàwǔ','buổi chiều','Thời gian','下午我读书。','Xiàwǔ wǒ dú shū.','Buổi chiều tôi đọc sách.'],
  [217,'晚上','wǎnshang','buổi tối','Thời gian','晚上她在家学习。','Wǎnshang tā zài jiā xuéxí.','Buổi tối cô ấy học ở nhà.'],
  [186,'时间','shíjiān','thời gian','Thời gian','我有时间读书。','Wǒ yǒu shíjiān dú shū.','Tôi có thời gian đọc sách.'],
  [247,'学','xué','học','Học tập','我学汉语。','Wǒ xué Hànyǔ.','Tôi học tiếng Trung.'],
  [249,'学习','xuéxí','học tập','Học tập','我们一起学习。','Wǒmen yìqǐ xuéxí.','Chúng tôi cùng nhau học.'],
  [248,'学生','xuéshēng','học sinh','Học tập','她是学生。','Tā shì xuéshēng.','Cô ấy là học sinh.'],
  [107,'老师','lǎoshī','giáo viên','Học tập','老师在教室。','Lǎoshī zài jiàoshì.','Giáo viên ở trong lớp học.'],
  [250,'学校','xuéxiào','trường học','Học tập','我的学校很大。','Wǒ de xuéxiào hěn dà.','Trường của tôi rất lớn.'],
  [190,'书','shū','sách','Học tập','这本书很好。','Zhè běn shū hěn hǎo.','Quyển sách này rất hay.'],
  [42,'读','dú','đọc','Học tập','我读这本书。','Wǒ dú zhè běn shū.','Tôi đọc quyển sách này.'],
  [240,'写','xiě','viết','Học tập','请写你的名字。','Qǐng xiě nǐ de míngzi.','Hãy viết tên của bạn.'],
  [103,'课','kè','bài học; tiết học','Học tập','今天有汉语课。','Jīntiān yǒu Hànyǔ kè.','Hôm nay có tiết tiếng Trung.'],
  [69,'汉语','Hànyǔ','tiếng Trung; Hán ngữ','Học tập','我喜欢学习汉语。','Wǒ xǐhuan xuéxí Hànyǔ.','Tôi thích học tiếng Trung.'],
  [21,'吃','chī','ăn','Ăn uống','我们一起吃饭。','Wǒmen yìqǐ chī fàn.','Chúng ta cùng ăn cơm.'],
  [77,'喝','hē','uống','Ăn uống','我想喝水。','Wǒ xiǎng hē shuǐ.','Tôi muốn uống nước.'],
  [192,'水','shuǐ','nước','Ăn uống','桌上有一杯水。','Zhuō shang yǒu yì bēi shuǐ.','Trên bàn có một cốc nước.'],
  [17,'茶','chá','trà','Ăn uống','爸爸每天喝茶。','Bàba měitiān hē chá.','Bố uống trà mỗi ngày.'],
  [50,'饭','fàn','cơm; bữa ăn','Ăn uống','妈妈在做饭。','Māma zài zuò fàn.','Mẹ đang nấu cơm.'],
  [125,'米饭','mǐfàn','cơm nấu','Ăn uống','我喜欢吃米饭。','Wǒ xǐhuan chī mǐfàn.','Tôi thích ăn cơm.'],
  [16,'菜','cài','món ăn; rau','Ăn uống','这个菜很好吃。','Zhège cài hěn hǎochī.','Món này rất ngon.'],
  [193,'水果','shuǐguǒ','trái cây','Ăn uống','我每天吃水果。','Wǒ měitiān chī shuǐguǒ.','Tôi ăn trái cây mỗi ngày.'],
  [159,'苹果','píngguǒ','quả táo','Ăn uống','她买了两个苹果。','Tā mǎi le liǎng ge píngguǒ.','Cô ấy đã mua hai quả táo.'],
  [225,'喜欢','xǐhuan','thích','Ăn uống','你喜欢喝茶吗？','Nǐ xǐhuan hē chá ma?','Bạn thích uống trà không?'],
];

const words = rows.map(([syllabusNo,hanzi,pinyin,meaningVi,topic,hanziExample,pinyinExample,translationVi], index) => ({
  id: `hsk1-${syllabusNo}`, level: 1, order: index + 1, syllabusNo, hanzi, pinyin, meaningVi, topic,
  example: { hanzi: hanziExample, pinyin: pinyinExample, translationVi }, reviewed: false,
}));
const csvValue = value => `"${String(value).replaceAll('"','""')}"`;
const csv = ['Hán,Pinyin,Nghĩa Việt,Câu ví dụ Hán,Pinyin câu ví dụ,Dịch câu ví dụ',
  ...words.map(w => [w.hanzi,w.pinyin,w.meaningVi,w.example.hanzi,w.example.pinyin,w.example.translationVi].map(csvValue).join(','))].join('\r\n') + '\r\n';
await mkdir('data/vocab', {recursive:true});
await mkdir('review', {recursive:true});
await writeFile('data/vocab/hsk1-batch1.json', JSON.stringify(words,null,2)+'\n');
await writeFile('review/hsk1-batch1.csv', '\ufeff'+csv);
console.log(`Wrote ${words.length} words and review CSV`);
