#!/usr/bin/env python3
"""Expand idiom database from 100 to 150 idioms (30 per galaxy)."""

import re

# Read the file
with open('src/data/idioms.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update header comment
content = content.replace('100 成语数据', '150 成语数据')
content = content.replace('5 星系 × 20 成语', '5 星系 × 30 成语')

# Update section comments from (20) to (30)
for name in ['历史典故', '神话传说', '自然风物', '为人处世', '情感心理']:
    content = content.replace(f'═══ {name} (20) ═══', f'═══ {name} (30) ═══')

# Update connection limit from 200 to 300
content = content.replace('限制总连线数不超过 200 条', '限制总连线数不超过 300 条')
content = content.replace('connections.length >= 200', 'connections.length >= 300')

# New idioms for each galaxy
new_history = """    { text: "约法三章", pinyin: "yuē fǎ sān zhāng", definition: "指订立简单明确的条款大家共同遵守。", story: "刘邦率军攻入咸阳后废除秦朝苛法，与百姓约法三章：杀人者死、伤人及盗抵罪。这一朴素的法律宣告赢得了关中百姓的人心为楚汉争霸奠定了民意基础。", galaxy: GalaxyCategory.HISTORY },
    { text: "暗渡陈仓", pinyin: "àn dù chén cāng", definition: "比喻用假象迷惑对方以达到某种目的。", story: "刘邦被项羽封到汉中后采纳韩信之计，明里派人修复栈道表示不再东归，暗地里却率大军从陈仓古道出兵一举平定三秦。", galaxy: GalaxyCategory.HISTORY },
    { text: "背水一战", pinyin: "bèi shuǐ yī zhàn", definition: "比喻决一死战死里求生。", story: "韩信率军攻打赵军时故意背靠河流列阵，士兵们知道没有退路个个拼死作战大破赵军。战后诸将问其故韩信说这是置之死地而后生。", galaxy: GalaxyCategory.HISTORY },
    { text: "鞠躬尽瘁", pinyin: "jū gōng jìn cuì", definition: "形容小心谨慎贡献出全部的精力。", story: "诸葛亮在北伐中原时写下出师表向后主刘禅表明心志。鞠躬尽瘁死而后已成为千古名句，诸葛亮最终积劳成疾病逝于五丈原军中以生命践行了他的誓言。", galaxy: GalaxyCategory.HISTORY },
    { text: "乐不思蜀", pinyin: "lè bù sī shǔ", definition: "比喻在新环境中得到乐趣不再想回到原来的环境。", story: "三国时期蜀汉灭亡后后主刘禅被迁往洛阳。司马昭问他是否想念蜀国，刘禅回答说此间乐不思蜀。这个回答既保全了性命也成为千古笑谈。", galaxy: GalaxyCategory.HISTORY },
    { text: "刮目相看", pinyin: "guā mù xiāng kàn", definition: "指别人已有进步不能再用老眼光看待。", story: "三国时吕蒙原本是一介武夫少不读书。在孙权的劝导下他发奋学习，后来鲁肃与他交谈后大惊说卿今者才略非复吴下阿蒙。吕蒙笑答士别三日即更刮目相待。", galaxy: GalaxyCategory.HISTORY },
    { text: "东山再起", pinyin: "dōng shān zài qǐ", definition: "比喻失势之后重新恢复地位。", story: "东晋名相谢安早年隐居会稽东山不做官，直到国家危难时才出山任职。他在淝水之战中以少胜多打败前秦大军，东山再起从此成为重新崛起的代名词。", galaxy: GalaxyCategory.HISTORY },
    { text: "投笔从戎", pinyin: "tóu bǐ cóng róng", definition: "指文人放下笔杆参军报国。", story: "东汉班超家境贫寒以抄书为生。有一天他扔掉毛笔感叹说大丈夫应该像张骞那样在边疆建功立业怎能老死在笔砚之间。于是他投笔从戎后来出使西域立下赫赫功勋。", galaxy: GalaxyCategory.HISTORY },
    { text: "毛遂自荐", pinyin: "máo suì zì jiàn", definition: "比喻自告奋勇推荐自己去担任某项工作。", story: "战国时赵国平原君要出使楚国挑选二十位门客随行只选到了十九人。门客毛遂主动自荐，平原君以锥处囊中为喻质疑他但毛遂说若早处囊中早已脱颖而出。在楚国毛遂挺身而出说服楚王结盟。", galaxy: GalaxyCategory.HISTORY },
    { text: "老当益壮", pinyin: "lǎo dāng yì zhuàng", definition: "年纪虽老但志气更旺盛干劲更足。", story: "东汉名将马援暮年仍然主动请缨出征。他说男儿要当死于边野以马革裹尸还葬耳何能卧床上在儿女子手中邪。老当益壮穷且益坚正是马援一生的写照。", galaxy: GalaxyCategory.HISTORY },
"""

new_mythology = """    { text: "盘古开天", pinyin: "pán gǔ kāi tiān", definition: "比喻宇宙的创始或前所未有的大事业。", story: "传说天地混沌如鸡子，盘古生其中沉睡万八千岁。醒来后挥巨斧劈开混沌，轻清者上升为天，重浊者下沉为地，盘古以身躯撑天立地从而创造了世界。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "吴刚伐桂", pinyin: "wú gāng fá guì", definition: "比喻徒劳无功的坚持或永无止境的修炼。", story: "传说月宫中有一棵五百丈高的桂树，吴刚因学仙有过被罚砍树。但桂树随砍随合永远砍不倒，吴刚便永远在月宫伐桂不息。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "庄周梦蝶", pinyin: "zhuāng zhōu mèng dié", definition: "比喻人生如梦、物我两忘的哲学境界。", story: "出自庄子齐物论：庄周梦见自己变成了一只蝴蝶，翩翩飞舞悠然自得。醒来后不知是庄周梦了蝴蝶还是蝴蝶梦了庄周——物我两忘万物齐一。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "天马行空", pinyin: "tiān mǎ xíng kōng", definition: "比喻才思敏捷豪放不羁或想象力丰富不受拘束。", story: "汉武帝得到西域大宛的汗血宝马称之为天马。后来以此比喻诗文书法气势奔放不受拘束，如同天马在天空中自由驰骋。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "龙马精神", pinyin: "lóng mǎ jīng shén", definition: "比喻精神健壮充沛。", story: "传说伏羲时代有龙马从黄河中出现背负河图。龙马兼具龙的威严与马的矫健，后人以此形容人精神旺盛老当益壮。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "杜鹃啼血", pinyin: "dù juān tí xuè", definition: "形容哀痛之极也指春天杜鹃花开。", story: "传说古蜀国望帝杜宇死后化为杜鹃鸟，每到春天便悲鸣不止直至口中啼出血来染红了山花。唐代李商隐诗云望帝春心托杜鹃。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "水漫金山", pinyin: "shuǐ màn jīn shān", definition: "比喻来势凶猛无法阻挡的力量。", story: "白蛇传中白娘子为救丈夫许仙，与法海和尚在金山寺大战。白娘子施展法力引来大水漫灌金山寺，水漫金山的传说由此而来。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "麻姑献寿", pinyin: "má gū xiàn shòu", definition: "比喻以珍贵的礼物向长者祝寿。", story: "传说仙女麻姑曾见东海三次变为桑田，她每年在王母娘娘的蟠桃会上献上灵芝仙酒为西王母祝寿。麻姑献寿成为中国传统年画中常见的祝寿题材。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "蟠桃盛会", pinyin: "pán táo shèng huì", definition: "比喻盛大的聚会宴请。", story: "西王母在瑶池仙境中种植蟠桃三千年一开花三千年一结果。每逢蟠桃成熟她便邀请各路神仙前来赴宴，这便是蟠桃盛会的由来。", galaxy: GalaxyCategory.MYTHOLOGY },
    { text: "青鸟殷勤", pinyin: "qīng niǎo yīn qín", definition: "比喻传递消息的信使。", story: "传说西王母有三只青鸟作为信使，它们往来于天地之间传递消息。李商隐无题诗云蓬山此去无多路青鸟殷勤为探看表达了借青鸟传书的愿望。", galaxy: GalaxyCategory.MYTHOLOGY },
"""

new_nature = """    { text: "春暖花开", pinyin: "chūn nuǎn huā kāi", definition: "春天气候温暖百花盛开形容美丽的景色。", story: "明代朱国祯涌幢小品中写道春暖花开正好游玩。春回大地万物复苏百花竞放是一年中最美好的季节。", galaxy: GalaxyCategory.NATURE },
    { text: "秋高气爽", pinyin: "qiū gāo qì shuǎng", definition: "形容秋天天空晴朗明净气候凉爽宜人。", story: "秋季的天空显得格外高远空气清爽宜人。古人在这样的天气里登高望远饮酒赏菊留下无数秋日诗篇。杜甫登高诗云风急天高猿啸哀渚清沙白鸟飞回。", galaxy: GalaxyCategory.NATURE },
    { text: "柳暗花明", pinyin: "liǔ àn huā míng", definition: "比喻在困境中看到希望。", story: "出自陆游游山西村诗：山重水复疑无路柳暗花明又一村。诗人在走投无路之际忽然发现柳荫深处鲜花明艳一个村庄出现在眼前。", galaxy: GalaxyCategory.NATURE },
    { text: "莺歌燕舞", pinyin: "yīng gē yàn wǔ", definition: "形容春天的美好景象也比喻形势大好。", story: "春天的江南黄莺婉转歌唱燕子翩翩起舞。苏轼诗云莺初解语最是一年春好处，描绘了一派莺歌燕舞生机盎然的景象。", galaxy: GalaxyCategory.NATURE },
    { text: "烟波浩渺", pinyin: "yān bō hào miǎo", definition: "形容烟雾笼罩的江湖水面广阔无边。", story: "出自崔颢黄鹤楼诗：日暮乡关何处是烟波江上使人愁。诗人站在黄鹤楼上望着烟波浩渺的长江，一种深沉的乡愁油然而生。", galaxy: GalaxyCategory.NATURE },
    { text: "层峦叠嶂", pinyin: "céng luán dié zhàng", definition: "形容山峰连绵起伏重重叠叠。", story: "中国的山水画最讲究层峦叠嶂的意境。北魏郦道元水经注中描写三峡两岸连山略无阙处重岩叠嶂隐天蔽日。层层叠叠的山峰构成了中国山水最美的轮廓。", galaxy: GalaxyCategory.NATURE },
    { text: "银河倒泻", pinyin: "yín hé dào xiè", definition: "形容瀑布飞泻的壮观景象。", story: "出自李白望庐山瀑布诗：飞流直下三千尺疑是银河落九天。李白用银河倒泻来比喻庐山瀑布的壮丽，成为中国文学中最经典的瀑布描写。", galaxy: GalaxyCategory.NATURE },
    { text: "金风玉露", pinyin: "jīn fēng yù lù", definition: "泛指秋天的景物也比喻珍贵短暂的相逢。", story: "出自秦观鹊桥仙词：金风玉露一相逢便胜却人间无数。秋风如金露水如玉，牛郎织女在这样美好的秋夜里鹊桥相会珍贵无比。", galaxy: GalaxyCategory.NATURE },
    { text: "碧空如洗", pinyin: "bì kōng rú xǐ", definition: "形容蓝色的天空明净得像洗过一样。", story: "大雨过后天空湛蓝没有一丝云彩好像被清水冲洗过一样。宋代诗人杨万里诗云雨余天宇净如洗正是这种令人心旷神怡的景致。", galaxy: GalaxyCategory.NATURE },
    { text: "繁花似锦", pinyin: "fán huā sì jǐn", definition: "形容许多色彩纷繁的鲜花像锦绣一样美丽。", story: "春天的花园里繁花盛开如锦似缎美不胜收。清代曹雪芹在红楼梦中描写大观园的春日盛景繁花似锦绿草如茵令人流连忘返。", galaxy: GalaxyCategory.NATURE },
"""

new_philosophy = """    { text: "居安思危", pinyin: "jū ān sī wēi", definition: "处在安定环境中要想到可能出现的危难。", story: "出自左传襄公十一年：居安思危思则有备有备无患。魏绛劝谏晋悼公在和平安定的时候也不要忘记潜在的危难时刻保持警惕。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "防微杜渐", pinyin: "fáng wēi dù jiàn", definition: "在坏事刚露头时就加以制止不使其发展。", story: "出自后汉书丁鸿传：若敕政责躬杜渐防萌则凶妖消灭害除福凑矣。小的错误如果不及时纠正就会酿成大祸——防火要在星星之火时扑灭。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "集思广益", pinyin: "jí sī guǎng yì", definition: "集中众人的智慧广泛吸取有益的意见。", story: "诸葛亮在出师表中告诫后主刘禅要集众思广忠益。一个人的智慧是有限的，只有广泛听取大家的意见才能做出最好的决策。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "知行合一", pinyin: "zhī xíng hé yī", definition: "认识和行动要统一起来。", story: "明代思想家王阳明提出知行合一的学说。他认为知而不行只是未知——真正的知识必须付诸行动在做的过程中验证和深化认知。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "温故知新", pinyin: "wēn gù zhī xīn", definition: "温习旧的知识能得到新的理解和体会。", story: "出自论语为政：温故而知新可以为师矣。孔子认为学习不仅是接受新知识更是反复温习旧知识从而获得更深刻的理解。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "身体力行", pinyin: "shēn tǐ lì xíng", definition: "亲身体验和努力实践。", story: "出自礼记中庸：好学近乎知力行近乎仁知耻近乎勇。真正的学问不是空谈理论而是要亲自实践。身体力行者方能体会知行合一的真谛。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "克己奉公", pinyin: "kè jǐ fèng gōng", definition: "克制自己的私欲一心为公。", story: "出自后汉书祭遵传：遵为人廉约小心克己奉公。东汉名将祭遵军纪严明不徇私情，他一生清廉自守所有赏赐都分给士兵自己家无余财。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "循序渐进", pinyin: "xún xù jiàn jìn", definition: "按照一定的步骤逐渐深入或提高。", story: "出自论语宪问：不怨天不尤人下学而上达。朱熹注解说学习要循序渐进——从浅到深从易到难不可躐等而进这是做学问的正道。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "学以致用", pinyin: "xué yǐ zhì yòng", definition: "学习是为了实际应用。", story: "古人读书讲究经世致用——学到的知识要对社会有用处。纸上得来终觉浅绝知此事要躬行，真正的学问在于能够解决实际问题。", galaxy: GalaxyCategory.PHILOSOPHY },
    { text: "兼听则明", pinyin: "jiān tīng zé míng", definition: "多方面听取意见才能明辨是非。", story: "出自资治通鉴唐太宗贞观二年：兼听则明偏信则暗。魏征劝谏唐太宗要广泛听取不同意见才能做出明智的判断——只听一面之词的人永远看不清真相。", galaxy: GalaxyCategory.PHILOSOPHY },
"""

new_emotion = """    { text: "魂牵梦萦", pinyin: "hún qiān mèng yíng", definition: "形容万分思念连梦里都牵挂着。", story: "对远方亲人的思念深入骨髓——白天魂牵梦绕夜晚梦中萦回。宋代词人晏几道写道从别后忆相逢几回魂梦与君同。这种魂牵梦萦的深情令人动容。", galaxy: GalaxyCategory.EMOTION },
    { text: "牵肠挂肚", pinyin: "qiān cháng guà dù", definition: "形容非常惦念放心不下。", story: "母亲对远行儿女的牵挂是牵肠挂肚——仿佛有一根无形的线连着彼此。这句成语出自元代郑廷玉的杂剧，生动地表达了中国人对亲情的深刻执念。", galaxy: GalaxyCategory.EMOTION },
    { text: "喜出望外", pinyin: "xǐ chū wàng wài", definition: "遇到出乎意料的好事而特别高兴。", story: "好事的发生常常令人措手不及——当期盼已久的事情终于实现比预期的更加美好时，那种喜出望外的心情是人间最纯粹的快乐。", galaxy: GalaxyCategory.EMOTION },
    { text: "心满意足", pinyin: "xīn mǎn yì zú", definition: "心里感到十分满足。", story: "人生最大的幸福不是拥有多少而是知足。当一个人对当前的生活心满意足的时候，他便已经拥有了世界上最宝贵的东西——内心的平静与从容。", galaxy: GalaxyCategory.EMOTION },
    { text: "神魂颠倒", pinyin: "shén hún diān dǎo", definition: "形容对人或事入迷着魔精神恍惚。", story: "出自明代冯梦龙醒世恒言：只为这冤家害得我神魂颠倒。爱一个人到深处便会茶饭不思神不守舍——这便是神魂颠倒的滋味。", galaxy: GalaxyCategory.EMOTION },
    { text: "欣喜若狂", pinyin: "xīn xǐ ruò kuáng", definition: "形容高兴到了极点。", story: "当杜甫听到官军收复失地的消息时欣喜若狂写下闻官军收河南河北：却看妻子愁何在漫卷诗书喜欲狂。那种欣喜若狂是压抑太久之后终于爆发的欢欣。", galaxy: GalaxyCategory.EMOTION },
    { text: "愁眉不展", pinyin: "chóu méi bù zhǎn", definition: "形容心事重重的样子。", story: "心中有忧虑的时候眉头紧锁怎么也舒展不开。唐代诗人李白诗云抽刀断水水更流举杯消愁愁更愁——愁眉不展的时候连酒也解不了心中的郁结。", galaxy: GalaxyCategory.EMOTION },
    { text: "感慨万千", pinyin: "gǎn kǎi wàn qiān", definition: "因外界事物变化很大而引起许多感想感触。", story: "当一个人经历了世事沧桑再回首往事的时候心中涌起的便是感慨万千。苏轼赤壁赋中感叹寄蜉蝣于天地渺沧海之一粟——面对永恒的天地个人的悲欢都变得微不足道。", galaxy: GalaxyCategory.EMOTION },
    { text: "惴惴不安", pinyin: "zhuì zhuì bù ān", definition: "形容因害怕或担心而深感不安。", story: "出自诗经秦风黄鸟：临其穴惴惴其栗。面对未知的危险或不确定的未来，那种心中七上八下惴惴不安的感觉每个人都有过。", galaxy: GalaxyCategory.EMOTION },
    { text: "黯然神伤", pinyin: "àn rán shén shāng", definition: "形容极度悲伤或沮丧的样子。", story: "出自江淹别赋：黯然销魂者唯别而已矣。人世间的离别最令人黯然神伤——目送远行的人渐行渐远心中仿佛被掏空了一般。", galaxy: GalaxyCategory.EMOTION },
"""

# Insert new idioms before each galaxy section boundary
insertions = [
    ('// ═══════════ 神话传说 (20) ═══════════', new_history),
    ('// ═══════════ 自然风物 (20) ═══════════', new_mythology),
    ('// ═══════════ 为人处世 (20) ═══════════', new_nature),
    ('// ═══════════ 情感心理 (20) ═══════════', new_philosophy),
    ('  ];', new_emotion),  # before the closing bracket of rawIdioms
]

for marker, new_text in insertions:
    content = content.replace(marker, new_text + marker)

with open('src/data/idioms.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
count = content.count('{ text:')
print(f'Total idiom entries: {count}')
print('File updated successfully!')
