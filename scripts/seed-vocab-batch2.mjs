import { mkdir, writeFile } from 'node:fs/promises';

// Learning order 61–120. syllabusNo and headword pinyin follow the November
// 2025 HSK examination syllabus, HSK（一级）词汇; all examples are authored here.
const rows = [
  // Day 7 · food and drink
  [8,'包子','bāozi','bánh bao','Ăn uống','我早饭吃包子。','Wǒ zǎofàn chī bāozi.','Bữa sáng tôi ăn bánh bao.'],
  [90,'饺子','jiǎozi','sủi cảo','Ăn uống','我喜欢吃饺子。','Wǒ xǐhuan chī jiǎozi.','Tôi thích ăn sủi cảo.'],
  [126,'面包','miànbāo','bánh mì','Ăn uống','早上我吃面包。','Zǎoshang wǒ chī miànbāo.','Buổi sáng tôi ăn bánh mì.'],
  [127,'面条儿','miàntiáor','mì sợi','Ăn uống','我中午吃面条儿。','Wǒ zhōngwǔ chī miàntiáor.','Buổi trưa tôi ăn mì.'],
  [84,'鸡蛋','jīdàn','trứng gà','Ăn uống','早饭我吃鸡蛋。','Zǎofàn wǒ chī jīdàn.','Bữa sáng tôi ăn trứng gà.'],
  [151,'牛奶','niúnǎi','sữa bò','Ăn uống','我早上喝牛奶。','Wǒ zǎoshang hē niúnǎi.','Buổi sáng tôi uống sữa bò.'],
  [9,'杯子','bēizi','cái cốc; cái ly','Ăn uống','杯子里有水。','Bēizi lǐ yǒu shuǐ.','Trong cốc có nước.'],
  [72,'好吃','hǎochī','ngon (đồ ăn)','Ăn uống','这个包子很好吃。','Zhège bāozi hěn hǎochī.','Chiếc bánh bao này rất ngon.'],
  [274,'早饭','zǎofàn','bữa sáng','Ăn uống','我在家吃早饭。','Wǒ zài jiā chī zǎofàn.','Tôi ăn sáng ở nhà.'],
  [224,'午饭','wǔfàn','bữa trưa','Ăn uống','今天的午饭很好吃。','Jīntiān de wǔfàn hěn hǎochī.','Bữa trưa hôm nay rất ngon.'],
  // Day 8 · shopping
  [216,'晚饭','wǎnfàn','bữa tối','Ăn uống','我和家人吃晚饭。','Wǒ hé jiārén chī wǎnfàn.','Tôi ăn tối cùng gia đình.'],
  [116,'买','mǎi','mua','Mua sắm','我买苹果。','Wǒ mǎi píngguǒ.','Tôi mua táo.'],
  [117,'卖','mài','bán','Mua sắm','商店卖水果。','Shāngdiàn mài shuǐguǒ.','Cửa hàng bán trái cây.'],
  [174,'商店','shāngdiàn','cửa hàng','Mua sắm','这家商店很大。','Zhè jiā shāngdiàn hěn dà.','Cửa hàng này rất lớn.'],
  [19,'超市','chāoshì','siêu thị','Mua sắm','我去超市买牛奶。','Wǒ qù chāoshì mǎi niúnǎi.','Tôi đến siêu thị mua sữa bò.'],
  [164,'钱','qián','tiền','Mua sắm','我没有钱。','Wǒ méiyǒu qián.','Tôi không có tiền.'],
  [268,'元','yuán','tệ (đơn vị tiền)','Mua sắm','这个包子五元。','Zhège bāozi wǔ yuán.','Chiếc bánh bao này giá năm tệ.'],
  [105,'块','kuài','đồng (tiền); miếng','Mua sắm','这个苹果两块钱。','Zhège píngguǒ liǎng kuài qián.','Quả táo này giá hai tệ.'],
  [65,'贵','guì','đắt','Mua sắm','这个苹果很贵。','Zhège píngguǒ hěn guì.','Quả táo này rất đắt.'],
  [157,'便宜','piányi','rẻ','Mua sắm','这个包子很便宜。','Zhège bāozi hěn piányi.','Chiếc bánh bao này rất rẻ.'],
  // Day 9 · travel and places
  [167,'去','qù','đi; đến','Đi lại','我去学校。','Wǒ qù xuéxiào.','Tôi đến trường.'],
  [106,'来','lái','đến; tới','Đi lại','请来我家吃饭。','Qǐng lái wǒ jiā chī fàn.','Mời bạn đến nhà tôi ăn cơm.'],
  [81,'回','huí','về; quay lại','Đi lại','下午我回家。','Xiàwǔ wǒ huí jiā.','Buổi chiều tôi về nhà.'],
  [29,'到','dào','đến; tới','Đi lại','我八点到学校。','Wǒ bā diǎn dào xuéxiào.','Tôi đến trường lúc tám giờ.'],
  [20,'车','chē','xe','Đi lại','这是什么车？','Zhè shì shénme chē?','Đây là xe gì?'],
  [22,'出租车','chūzūchē','xe taxi','Đi lại','我坐出租车去学校。','Wǒ zuò chūzūchē qù xuéxiào.','Tôi đi taxi đến trường.'],
  [83,'火车','huǒchē','tàu hỏa','Đi lại','他坐火车来。','Tā zuò huǒchē lái.','Anh ấy đến bằng tàu hỏa.'],
  [54,'飞机','fēijī','máy bay','Đi lại','我坐飞机去中国。','Wǒ zuò fēijī qù Zhōngguó.','Tôi đi máy bay đến Trung Quốc.'],
  [98,'开车','kāichē','lái xe','Đi lại','爸爸今天开车。','Bàba jīntiān kāichē.','Hôm nay bố lái xe.'],
  [51,'饭店','fàndiàn','nhà hàng','Đi lại','我们在饭店吃饭。','Wǒmen zài fàndiàn chī fàn.','Chúng tôi ăn ở nhà hàng.'],
  // Day 10 · daily routine
  [161,'起床','qǐchuáng','thức dậy','Sinh hoạt','我早上六点起床。','Wǒ zǎoshang liù diǎn qǐchuáng.','Tôi thức dậy lúc sáu giờ sáng.'],
  [195,'睡觉','shuìjiào','ngủ','Sinh hoạt','妹妹晚上九点睡觉。','Mèimei wǎnshang jiǔ diǎn shuìjiào.','Em gái ngủ lúc chín giờ tối.'],
  [179,'上学','shàngxué','đi học','Sinh hoạt','弟弟早上上学。','Dìdi zǎoshang shàngxué.','Em trai đi học vào buổi sáng.'],
  [177,'上课','shàngkè','vào học; học trên lớp','Sinh hoạt','我们八点上课。','Wǒmen bā diǎn shàngkè.','Chúng tôi vào học lúc tám giờ.'],
  [229,'下课','xiàkè','tan học; hết giờ học','Sinh hoạt','下午三点下课。','Xiàwǔ sān diǎn xiàkè.','Tan học lúc ba giờ chiều.'],
  [176,'上班','shàngbān','đi làm','Sinh hoạt','妈妈早上八点上班。','Māma zǎoshang bā diǎn shàngbān.','Mẹ đi làm lúc tám giờ sáng.'],
  [228,'下班','xiàbān','tan làm','Sinh hoạt','爸爸下午五点下班。','Bàba xiàwǔ wǔ diǎn xiàbān.','Bố tan làm lúc năm giờ chiều.'],
  [63,'工作','gōngzuò','làm việc; công việc','Sinh hoạt','姐姐在医院工作。','Jiějie zài yīyuàn gōngzuò.','Chị gái làm việc ở bệnh viện.'],
  [246,'休息','xiūxi','nghỉ ngơi','Sinh hoạt','今天我想休息。','Jīntiān wǒ xiǎng xiūxi.','Hôm nay tôi muốn nghỉ ngơi.'],
  [118,'忙','máng','bận','Sinh hoạt','老师今天很忙。','Lǎoshī jīntiān hěn máng.','Hôm nay giáo viên rất bận.'],
  // Day 11 · communication and perception
  [196,'说','shuō','nói','Giao tiếp','请说汉语。','Qǐng shuō Hànyǔ.','Xin hãy nói tiếng Trung.'],
  [197,'说话','shuōhuà','nói chuyện','Giao tiếp','他们在说话。','Tāmen zài shuōhuà.','Họ đang nói chuyện.'],
  [209,'听','tīng','nghe','Giao tiếp','我听你说话。','Wǒ tīng nǐ shuōhuà.','Tôi nghe bạn nói.'],
  [210,'听见','tīngjiàn','nghe thấy','Giao tiếp','我听见爸爸说话。','Wǒ tīngjiàn bàba shuōhuà.','Tôi nghe thấy bố nói chuyện.'],
  [99,'看','kàn','xem; nhìn','Giao tiếp','我看电影。','Wǒ kàn diànyǐng.','Tôi xem phim.'],
  [101,'看见','kànjiàn','nhìn thấy','Giao tiếp','我看见一只猫。','Wǒ kànjiàn yì zhī māo.','Tôi nhìn thấy một con mèo.'],
  [219,'问','wèn','hỏi','Giao tiếp','我问老师。','Wǒ wèn lǎoshī.','Tôi hỏi giáo viên.'],
  [220,'问题','wèntí','câu hỏi; vấn đề','Giao tiếp','我有一个问题。','Wǒ yǒu yí ge wèntí.','Tôi có một câu hỏi.'],
  [288,'知道','zhīdào','biết','Giao tiếp','我知道他的名字。','Wǒ zhīdào tā de míngzi.','Tôi biết tên anh ấy.'],
  [171,'认识','rènshi','quen; biết (một người)','Giao tiếp','我认识这个老师。','Wǒ rènshi zhège lǎoshī.','Tôi quen giáo viên này.'],
  // Day 12 · weather and health
  [208,'天气','tiānqì','thời tiết','Thời tiết','今天天气很好。','Jīntiān tiānqì hěn hǎo.','Hôm nay thời tiết rất đẹp.'],
  [169,'热','rè','nóng','Thời tiết','中午很热。','Zhōngwǔ hěn rè.','Buổi trưa rất nóng.'],
  [109,'冷','lěng','lạnh','Thời tiết','今天很冷。','Jīntiān hěn lěng.','Hôm nay rất lạnh.'],
  [227,'下雨','xià yǔ','trời mưa','Thời tiết','外边下雨了。','Wàibian xià yǔ le.','Ngoài trời mưa rồi.'],
  [267,'雨','yǔ','mưa','Thời tiết','今天有雨。','Jīntiān yǒu yǔ.','Hôm nay có mưa.'],
  [251,'雪','xuě','tuyết','Thời tiết','外边有雪。','Wàibian yǒu xuě.','Ngoài trời có tuyết.'],
  [12,'病','bìng','bệnh; bị ốm','Sức khỏe','他病了。','Tā bìng le.','Anh ấy bị ốm rồi.'],
  [183,'生病','shēngbìng','bị ốm; mắc bệnh','Sức khỏe','今天老师生病了。','Jīntiān lǎoshī shēngbìng le.','Hôm nay giáo viên bị ốm.'],
  [256,'医生','yīshēng','bác sĩ','Sức khỏe','医生在医院。','Yīshēng zài yīyuàn.','Bác sĩ ở bệnh viện.'],
  [257,'医院','yīyuàn','bệnh viện','Sức khỏe','我去医院看病。','Wǒ qù yīyuàn kànbìng.','Tôi đến bệnh viện khám bệnh.'],
];

const words = rows.map(([syllabusNo,hanzi,pinyin,meaningVi,topic,hanziExample,pinyinExample,translationVi], index) => ({
  id:`hsk1-${syllabusNo}`, level:1, order:index+61, syllabusNo, hanzi, pinyin, meaningVi, topic,
  example:{hanzi:hanziExample,pinyin:pinyinExample,translationVi}, reviewed:true,
}));
const csvValue=value=>`"${String(value).replaceAll('"','""')}"`;
const csv=['Thứ tự học,syllabusNo,Hán,Pinyin,Nghĩa Việt,Câu ví dụ Hán,Pinyin câu ví dụ,Dịch câu ví dụ,Cần xem',
  ...words.map(w=>[w.order,w.syllabusNo,w.hanzi,w.pinyin,w.meaningVi,w.example.hanzi,w.example.pinyin,w.example.translationVi,''].map(csvValue).join(','))].join('\r\n')+'\r\n';
await mkdir('data/vocab',{recursive:true});await mkdir('review',{recursive:true});
await writeFile('data/vocab/hsk1-batch2.json',JSON.stringify(words,null,2)+'\n');
await writeFile('review/hsk1-batch2.csv','\ufeff'+csv);
console.log(`Wrote ${words.length} reviewed words (orders 61–120) and CSV`);
