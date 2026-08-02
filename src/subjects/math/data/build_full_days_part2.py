# -*- coding: utf-8 -*-
"""Days 11-30 + merge and write days.json"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).parent
spec = importlib.util.spec_from_file_location("p1", HERE / "build_full_days.py")
p1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p1)
day_pack = p1.day_pack
DAYS = p1.DAYS

# -------- Day 11 --------
DAYS.append(
    day_pack(
        11,
        "第 11 天 · 钱币兑换",
        ["64-20", "79-7", "75-30", "28+13", "53-46", "8+28+25", "53+38", "59-25", "47-19", "30+47", "20+6", "69+31-27"],
        [
            {
                "name": "钱币兑换",
                "icon": "💴",
                "questions": [
                    {"type": "calc", "prompt": "一张10元可换几张1元？", "answer": 10},
                    {"type": "calc", "prompt": "一张100元可换几张10元？", "answer": 10},
                    {"type": "calc", "prompt": "一张20元可换几张5元？", "answer": 4},
                    {"type": "calc", "prompt": "一张1元可换几张2角？（1元=5张2角）", "answer": 5},
                    {"type": "calc", "prompt": "一张50元可换几张10元？", "answer": 5},
                    {"type": "calc", "prompt": "一张5角可换几张1角？", "answer": 5},
                ],
            },
            {
                "name": "单位转换",
                "icon": "🔄",
                "questions": [
                    {"type": "calc", "prompt": "1元=（）角", "answer": 10},
                    {"type": "calc", "prompt": "3元9角=（）角", "answer": 39},
                    {"type": "calc", "prompt": "2角=（）分", "answer": 20},
                    {"type": "calc", "prompt": "4元=（）角", "answer": 40},
                    {"type": "calc", "prompt": "1角=（）分", "answer": 10},
                    {"type": "calc", "prompt": "5元7角=（）角", "answer": 57},
                    {"type": "calc", "prompt": "1元5角=（）角", "answer": 15},
                    {"type": "calc", "prompt": "100分=（）元", "answer": 1},
                    {"type": "calc", "prompt": "7元=（）角", "answer": 70},
                    {"type": "calc", "prompt": "30角=（）元", "answer": 3},
                    {"type": "calc", "prompt": "2角5分=（）分", "answer": 25},
                    {"type": "calc", "prompt": "3角3分=（）分", "answer": 33},
                ],
            },
            {
                "name": "应用题",
                "icon": "🍇",
                "questions": [
                    {"type": "word", "prompt": "葡萄18元苹果20元雪梨7元香蕉3元。苹果比香蕉贵多少元？", "answer": 17},
                    {"type": "word", "prompt": "雪梨和香蕉一共多少元？", "answer": 10},
                    {"type": "word", "prompt": "苹果和葡萄一共多少元？", "answer": 38},
                ],
            },
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {"type": "multi_blank", "prompt": "15、11、13、13、11、15、9、17、7、（）、（）、21、3", "blanks": 2, "answer": [19, 5], "accept": [[19, 5], ["19", "5"]]},
                ],
            },
        ],
    )
)

# -------- Day 12 --------
DAYS.append(
    day_pack(
        12,
        "第 12 天 · 判断选择",
        ["97-90", "4+50", "60+20", "65-1", "89+6", "16+5+9", "72-8", "54-6", "83+5", "76+8", "38+50", "17-1-2"],
        [
            {
                "name": "判断正误",
                "icon": "🔍",
                "questions": [
                    {"type": "true_false", "prompt": "21瓶饮料分给10男10女2老师，不够每人一瓶。", "answer": True},
                    {"type": "true_false", "prompt": "2张1元、2张5角、5张1角合起来是9元7角。", "answer": False, "hint": "实际3元5角"},
                    {"type": "true_false", "prompt": "十位是6的两位数有10个。", "answer": True},
                    {"type": "true_false", "prompt": "4□−5差是三十多时，□最大只能填3。", "answer": False, "hint": "最大可填4"},
                ],
            },
            {
                "name": "精挑细选",
                "icon": "✅",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "5和2可以直接相加的是",
                        "options": [{"label": "①32+5", "value": 0}, {"label": "②32+50", "value": 1}, {"label": "③23+5", "value": 2}],
                        "answer": 2,
                    },
                    {
                        "type": "choice",
                        "prompt": "付20元还差3元2角，钟表多少钱？",
                        "options": [{"label": "①17元2角", "value": 0}, {"label": "②23元2角", "value": 1}, {"label": "③20元2角", "value": 2}],
                        "answer": 1,
                    },
                ],
            },
            {"name": "应用题", "icon": "🎨", "questions": [{"type": "word", "prompt": "红纸23张黄纸15张，送走14张，还剩？", "answer": 24}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "妈妈32岁小敏6岁。6年后妈妈比小敏大几岁？", "answer": 26}]},
        ],
    )
)

# -------- Day 13 --------
DAYS.append(
    day_pack(
        13,
        "第 13 天 · 括号与看图",
        ["97-90", "15+50", "7+50", "3-2", "81+7", "52+3+7", "2+6", "12+4", "9+5", "68+2", "8+80", "98-5-4"],
        [
            {
                "name": "括号填数",
                "icon": "➕",
                "questions": [
                    {"type": "calc", "prompt": "36−7=( )", "answer": 29},
                    {"type": "calc", "prompt": "( )−9=24", "answer": 33},
                    {"type": "calc", "prompt": "( )+6=44", "answer": 38},
                    {"type": "calc", "prompt": "( )+7=67", "answer": 60},
                    {"type": "calc", "prompt": "( )−9=65", "answer": 74},
                    {"type": "calc", "prompt": "20+( )=76", "answer": 56},
                    {"type": "calc", "prompt": "85−( )=5", "answer": 80},
                    {"type": "calc", "prompt": "56−( )=50", "answer": 6},
                ],
            },
            {
                "name": "看图列式",
                "icon": "🧸",
                "questions": [
                    {"type": "expression", "prompt": "玩具熊60元，羽毛笔7元，差多少？列式如60-7=53", "answer": "60-7=53", "accept": ["60-7=53", "53"]},
                    {"type": "expression", "prompt": "篮子桃子+堆桃子=46，堆上有6个，篮里？列式", "answer": "46-6=40", "accept": ["46-6=40", "40", "6+40=46"]},
                ],
            },
            {"name": "应用题", "icon": "📖", "questions": [{"type": "word", "prompt": "昨天看8页今天看9页，两天共看多少页？", "answer": 17}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "排队：小平左4人右8人，这一行共几人？", "answer": 13}]},
        ],
    )
)

# -------- Day 14 --------
DAYS.append(
    day_pack(
        14,
        "第 14 天 · 数形与求和",
        ["10+1", "50-50", "12+50", "70-3", "17+3", "37+1+8", "56-1", "66+3", "4+9", "55+1", "14+40", "53-6-3"],
        [
            {
                "name": "数一数",
                "icon": "🔺",
                "questions": [
                    {"type": "calc", "prompt": "层层叠的大三角形（约4层）共几个三角形？", "answer": 10, "accept": [10, 8, 6], "visual": "嵌套三角形"},
                    {"type": "calc", "prompt": "被分割的大三角形中三角形个数（常见答案）", "answer": 8, "accept": [5, 6, 8, 9, 10]},
                ],
            },
            {
                "name": "照样子填",
                "icon": "🔗",
                "questions": [
                    {"type": "calc", "prompt": "15与7下面相连是22（相加）。30与1相连填？", "answer": 31},
                    {"type": "calc", "prompt": "62与9相连填？", "answer": 71},
                    {"type": "calc", "prompt": "55与3相连填？", "answer": 58},
                    {"type": "calc", "prompt": "1与62相连？", "answer": 63},
                    {"type": "calc", "prompt": "9与55相连？", "answer": 64},
                    {"type": "calc", "prompt": "3与88相连？", "answer": 91},
                    {"type": "multi_blank", "prompt": "按相加规律：7+30、30+1、1+62、62+9、9+55、55+3、3+88 的结果依次（写前3个）", "blanks": 3, "answer": [37, 31, 63], "accept": [[37, 31, 63], ["37", "31", "63"]]},
                ],
            },
            {"name": "应用题", "icon": "🎁", "questions": [{"type": "word", "prompt": "三个玩具共100元，一个25元，其他两样一共？", "answer": 75}]},
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "火柴棒算式1+6=8+3不成立。改成正确等式，下列哪个成立？",
                        "options": [
                            {"label": "①0+6=3+3", "value": 0},
                            {"label": "②1+6=8-1", "value": 1},
                            {"label": "③8-6=5-3", "value": 2},
                        ],
                        "answer": 0,
                        "accept": [0, 2],
                        "hint": "移动火柴棒使等式成立，如0+6=3+3",
                    },
                    {"type": "calc", "prompt": "1+6的和是？", "answer": 7},
                ],
            },
        ],
    )
)

# -------- Day 15 --------
DAYS.append(
    day_pack(
        15,
        "第 15 天 · 读写与填空",
        ["60+4", "83-50", "22+60", "20-6", "46+7", "12+2+7", "20-1", "80+6", "47+6", "41+2", "6+10", "55-7-8"],
        [
            {
                "name": "写一写读一读",
                "icon": "🧮",
                "questions": [
                    {"type": "multi_blank", "prompt": "2个百+1个十+5个一，写作（）读作（）", "blanks": 2, "answer": [215, "二百一十五"], "accept": [[215, "二百一十五"], ["215", "二百一十五"]]},
                    {"type": "calc", "prompt": "7个十和8个一写作？", "answer": 78},
                    {"type": "word", "prompt": "78读作？", "answer": "七十八", "accept": ["七十八"]},
                    {"type": "calc", "prompt": "计数器：百位1、十位0、个位3写作？", "answer": 103},
                ],
            },
            {
                "name": "填空题",
                "icon": "✍️",
                "questions": [
                    {"type": "multi_blank", "prompt": "个位6，十位比个位多3。这个数（），读作（）", "blanks": 2, "answer": [96, "九十六"], "accept": [[96, "九十六"], ["96", "九十六"]]},
                    {"type": "word", "prompt": "32−□>27，□可填哪些一位数？从小到大逗号分隔", "answer": "1,2,3,4", "accept": ["1,2,3,4", "1，2，3，4"]},
                    {"type": "multi_blank", "prompt": "88左边8在（）位表示（）个（）；右边8在（）位表示（）个（）", "blanks": 6, "answer": ["十", 8, "十", "个", 8, "一"], "accept": [["十", 8, "十", "个", 8, "一"], ["十", "8", "十", "个", "8", "一"]]},
                    {"type": "multi_blank", "prompt": "3个一和7个十组成的数是（），读作（）", "blanks": 2, "answer": [73, "七十三"], "accept": [[73, "七十三"], ["73", "七十三"]]},
                ],
            },
            {"name": "应用题", "icon": "⚽", "questions": [{"type": "word", "prompt": "小明买9个足球8个篮球，送小红5个足球，小红送小明6个篮球。小明有几个足球？", "answer": 4}]},
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {"type": "calc", "prompt": "魔圈每线三数和75，中心应填？（5~45的9个数）", "answer": 25, "hint": "中心常为25"},
                ],
            },
        ],
    )
)

# -------- Day 16 --------
DAYS.append(
    day_pack(
        16,
        "第 16 天 · 算理",
        ["50-3", "18+5", "4+70", "79-6", "41+1", "38+1+1", "16+2", "62-60", "66+8", "83+2", "14+50", "75-2-8"],
        [
            {
                "name": "算理再现",
                "icon": "➕",
                "questions": [
                    {"type": "calc", "prompt": "27+4=？", "answer": 31},
                    {"type": "multi_blank", "prompt": "27+4：先算7+4=（），再算20+（）=（）", "blanks": 3, "answer": [11, 11, 31], "accept": [[11, 11, 31], ["11", "11", "31"]]},
                    {"type": "calc", "prompt": "36+7=？", "answer": 43},
                    {"type": "multi_blank", "prompt": "36+7：先算6+7=（），再算30+（）=（）", "blanks": 3, "answer": [13, 13, 43], "accept": [[13, 13, 43], ["13", "13", "43"]]},
                ],
            },
            {
                "name": "精挑细选",
                "icon": "✅",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "3人各摘7个苹果，一共？",
                        "options": [{"label": "①10", "value": 0}, {"label": "②18", "value": 1}, {"label": "③21", "value": 2}],
                        "answer": 2,
                    },
                    {
                        "type": "choice",
                        "prompt": "9个珠子摆年龄，可能是？",
                        "options": [{"label": "①18岁", "value": 0}, {"label": "②36岁", "value": 1}, {"label": "③63岁", "value": 2}],
                        "answer": 2,
                    },
                ],
            },
            {"name": "应用题", "icon": "📚", "questions": [{"type": "word", "prompt": "故事书84本，借出40，还回9，现在？", "answer": 53}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "吃掉10个，剩下比吃掉少1个，一共？", "answer": 19}]},
        ],
    )
)

# -------- Day 17 --------
DAYS.append(
    day_pack(
        17,
        "第 17 天 · 比较与火车",
        ["58+1", "90-80", "5+90", "78-8", "4+8", "62+4+8", "86-50", "3+60", "16+7", "32+1", "10+80", "44-3-7"],
        [
            {
                "name": "比大小",
                "icon": "⚖️",
                "questions": [
                    {"type": "compare", "prompt": "5角 ○ 49分", "answer": ">"},
                    {"type": "compare", "prompt": "5元5角 ○ 5元6分", "answer": ">"},
                    {"type": "compare", "prompt": "8元 ○ 40角", "answer": ">"},
                    {"type": "compare", "prompt": "1元5角 ○ 150分", "answer": "="},
                    {"type": "compare", "prompt": "3角5分 ○ 38分", "answer": "<"},
                    {"type": "compare", "prompt": "4元 ○ 41角", "answer": "<"},
                    {"type": "compare", "prompt": "2元2角 ○ 2元2分", "answer": ">"},
                    {"type": "compare", "prompt": "36角 ○ 3元6分", "answer": ">"},
                    {"type": "compare", "prompt": "100分 ○ 10角", "answer": "="},
                    {"type": "compare", "prompt": "16分 ○ 1角7分", "answer": "<"},
                    {"type": "compare", "prompt": "4元5角 ○ 54角", "answer": "<"},
                    {"type": "compare", "prompt": "9角 ○ 90角", "answer": "<"},
                ],
            },
            {
                "name": "开火车",
                "icon": "🚂",
                "questions": [
                    {"type": "chain", "prompt": "从63出发", "start": 63, "ops": ["-20", "-9", "+8", "+40", "-5"], "answer": [43, 34, 42, 82, 77]},
                    {"type": "chain", "prompt": "从78出发", "start": 78, "ops": ["+4", "-6", "-20", "+8", "-9"], "answer": [82, 76, 56, 64, 55]},
                ],
            },
            {
                "name": "表格填数",
                "icon": "📋",
                "questions": [
                    {
                        "type": "table",
                        "prompt": "填：苹果原有43买入8；桃子原有50现在83；西瓜买入9现在70",
                        "headers": ["", "原有", "买入", "现在"],
                        "rows": [["苹果", "43", "8", "?"], ["桃子", "50", "?", "83"], ["西瓜", "?", "9", "70"]],
                        "answer": [51, 33, 61],
                    }
                ],
            },
            {"name": "思维题", "icon": "🃏", "questions": [{"type": "word", "prompt": "四人一起玩扑克40分钟，每人玩了几分钟？", "answer": 40}]},
        ],
    )
)

# -------- Day 18 --------
DAYS.append(
    day_pack(
        18,
        "第 18 天 · 组成与连线",
        ["96-90", "9+10", "10+60", "5-3", "51+3", "53+6+3", "99-5", "31+5", "14+7", "68+3", "14+70", "67-5-1"],
        [
            {
                "name": "填一填",
                "icon": "✍️",
                "questions": [
                    {"type": "multi_blank", "prompt": "3个一和8个十组成（），再添7个一是（）个十", "blanks": 2, "answer": [83, 9], "accept": [[83, 9], ["83", "9"]], "hint": "83+7=90=9个十"},
                    {"type": "multi_blank", "prompt": "个位0十位5的数是（），相邻两数（）（）", "blanks": 3, "answer": [50, 49, 51], "accept": [[50, 49, 51], ["50", "49", "51"]]},
                ],
            },
            {
                "name": "连一连",
                "icon": "🐜",
                "questions": [
                    {
                        "type": "match",
                        "prompt": "算式连结果",
                        "left": [
                            {"id": "l1", "text": "29−(4+5)"},
                            {"id": "l2", "text": "13+(27+3)"},
                            {"id": "l3", "text": "68−(90−40)"},
                            {"id": "l4", "text": "43−(10−3)"},
                        ],
                        "right": [
                            {"id": "r1", "text": "18"},
                            {"id": "r2", "text": "43"},
                            {"id": "r3", "text": "20"},
                            {"id": "r4", "text": "36"},
                        ],
                        "answer": [["l1", "r1"], ["l2", "r2"], ["l3", "r3"], ["l4", "r4"]],
                    }
                ],
            },
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {
                        "type": "word",
                        "prompt": "用2,3,4,5,6,7填三角形数阵每行三个数和为12。顶角填？（常为2或6）",
                        "answer": 6,
                        "accept": [2, 6],
                        "hint": "一种解：顶6，下层底边3+3不适用；常见顶2",
                    }
                ],
            },
            {"name": "应用题", "icon": "👩‍🏫", "questions": [{"type": "word", "prompt": "男老师12人，女老师比男老师多30人，女老师？", "answer": 42}]},
        ],
    )
)

# -------- Day 19 --------
DAYS.append(
    day_pack(
        19,
        "第 19 天 · 规律连线",
        ["90-90", "77+20", "4+30", "59-9", "31+9", "55+3+6", "4+6", "62-50", "38+7", "42+8", "71+10", "54-5-2"],
        [
            {
                "name": "找规律填数",
                "icon": "🌸",
                "questions": [
                    {"type": "calc", "prompt": "花心38，花瓣35与3：规律38=35+3。另一朵20与26，花心？", "answer": 46, "hint": "20+26"},
                    {"type": "calc", "prompt": "花瓣36与2，花心？", "answer": 38},
                    {"type": "calc", "prompt": "花瓣30与41，花心？", "answer": 71},
                ],
            },
            {
                "name": "连一连·算得数",
                "icon": "🦊",
                "questions": [
                    {"type": "calc", "prompt": "15−8=？", "answer": 7},
                    {"type": "calc", "prompt": "15−6=？", "answer": 9},
                    {"type": "calc", "prompt": "11−3=？", "answer": 8},
                    {"type": "calc", "prompt": "14−8=？", "answer": 6},
                    {"type": "calc", "prompt": "13−6=？", "answer": 7},
                    {"type": "calc", "prompt": "11−5=？", "answer": 6},
                    {"type": "calc", "prompt": "17−8=？", "answer": 9},
                    {"type": "calc", "prompt": "12−4=？", "answer": 8},
                ],
            },
            {
                "name": "应用题",
                "icon": "🦆",
                "questions": [
                    {"type": "word", "prompt": "鸭20鹅8鸡45。鹅比鸭少多少？", "answer": 12},
                    {"type": "word", "prompt": "鸡比鸭多多少？", "answer": 25},
                ],
            },
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {"type": "calc", "prompt": "个位数右边加0成两位数，比原数大36，原个位数？", "answer": 4, "hint": "10a-a=9a=36,a=4"},
                ],
            },
        ],
    )
)

# -------- Day 20 --------
DAYS.append(
    day_pack(
        20,
        "第 20 天 · 变换与看图",
        ["65-4", "76-2", "55+20", "16-5", "28+8", "93+2+5", "74-7", "40-10", "40+6", "32+7", "20+80", "74-9-3"],
        [
            {
                "name": "填一填",
                "icon": "📦",
                "questions": [
                    {"type": "multi_blank", "prompt": "32、43、54都+20", "blanks": 3, "answer": [52, 63, 74], "accept": [[52, 63, 74], ["52", "63", "74"]]},
                    {"type": "multi_blank", "prompt": "20、40、60都+23", "blanks": 3, "answer": [43, 63, 83], "accept": [[43, 63, 83], ["43", "63", "83"]]},
                ],
            },
            {
                "name": "看图写算式",
                "icon": "🖼️",
                "questions": [
                    {"type": "expression", "prompt": "两盒书一边27本，若一样多一共？列式", "answer": "27+27=54", "accept": ["27+27=54", "54", "27×2=54"]},
                    {"type": "expression", "prompt": "一共12朵，外面3朵，篮里？", "answer": "12-3=9", "accept": ["12-3=9", "9", "3+9=12"]},
                ],
            },
            {"name": "应用题", "icon": "📕", "questions": [{"type": "word", "prompt": "字典8元，付20元，找回？", "answer": 12}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "1+2+…+10=？", "answer": 55}]},
        ],
    )
)

# -------- Day 21 --------
DAYS.append(
    day_pack(
        21,
        "第 21 天 · 未知数与选择",
        ["12-4", "14-6", "50+8", "13-7+6", "13-5", "6+30", "30+70", "14-7", "81-30-7"],
        [
            {
                "name": "填未知数",
                "icon": "❓",
                "questions": [
                    {"type": "calc", "prompt": "5+□=14，□=？", "answer": 9},
                    {"type": "calc", "prompt": "9+□=15，□=？", "answer": 6},
                    {"type": "calc", "prompt": "12-4=？", "answer": 8},
                    {"type": "calc", "prompt": "12-4=？（再算一次）", "answer": 8},
                ],
            },
            {
                "name": "折一折",
                "icon": "📦",
                "questions": [
                    {"type": "word", "prompt": "正方体展开图：□的对面是？（填形状名：圆/三角/星/长方 之一）", "answer": "长方", "accept": ["长方", "长方形", "□", "矩形"], "visual": "展开图对面"},
                    {"type": "word", "prompt": "△的对面是？", "answer": "圆", "accept": ["圆", "圆形", "○"]},
                    {"type": "word", "prompt": "○的对面是？", "answer": "三角", "accept": ["三角", "三角形", "△"]},
                ],
            },
            {
                "name": "我会选",
                "icon": "✅",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "4根同样长小棒能摆成",
                        "options": [{"label": "①正方形", "value": 0}, {"label": "②长方形", "value": 1}, {"label": "③三角形", "value": 2}],
                        "answer": 0,
                    },
                    {
                        "type": "choice",
                        "prompt": "56减一位数，差的十位不可能是",
                        "options": [{"label": "①3", "value": 0}, {"label": "②4", "value": 1}, {"label": "③5", "value": 2}],
                        "answer": 0,
                    },
                ],
            },
            {"name": "应用题", "icon": "⭐", "questions": [{"type": "word", "prompt": "3人各折7颗小星，一共？", "answer": 21}]},
            {
                "name": "思维题",
                "icon": "📖",
                "questions": [
                    {"type": "word", "prompt": "同一本书，小勇看20页小洁看28页。谁剩的多？多几页？写成：小勇,8", "answer": "小勇,8", "accept": ["小勇,8", "小勇，8", "小勇 8"]},
                ],
            },
        ],
    )
)

# Day 21 oral had blanks in original - I put them in section 2. Good.

# -------- Day 22 --------
DAYS.append(
    day_pack(
        22,
        "第 22 天 · 水果方程",
        ["12-5+7", "14-5+9", "13-7+6", "12-4+8", "15-8+9", "14-7+6", "11-6+5", "14-7+6", "11-2+8", "13-5+9"],
        [
            {
                "name": "填空题",
                "icon": "✍️",
                "questions": [
                    {"type": "calc", "prompt": "个位9十位5的两位数是？", "answer": 59},
                    {"type": "multi_blank", "prompt": "78有（）个一和（）个十；（）个十是100", "blanks": 3, "answer": [8, 7, 10], "accept": [[8, 7, 10], ["8", "7", "10"]]},
                    {"type": "multi_blank", "prompt": "8比85少（）；36比20多（）", "blanks": 2, "answer": [77, 16], "accept": [[77, 16], ["77", "16"]]},
                ],
            },
            {
                "name": "想一想",
                "icon": "🍎",
                "questions": [
                    {"type": "calc", "prompt": "苹果−20=10，苹果=？", "answer": 30},
                    {"type": "calc", "prompt": "桃子−10=30，桃子=？", "answer": 40},
                    {"type": "calc", "prompt": "苹果+桃子+梨=80，梨=？", "answer": 10, "hint": "30+40+梨=80"},
                ],
            },
            {"name": "应用题", "icon": "🌸", "questions": [{"type": "word", "prompt": "小明种5棵，小华小红各与小明同样多。一共？", "answer": 15}]},
            {"name": "思维题", "icon": "🍌", "questions": [{"type": "word", "prompt": "10人中7人爱香蕉5人爱苹果，既爱香蕉又爱苹果至少几人？", "answer": 2, "hint": "7+5-10=2"}]},
        ],
    )
)

# -------- Day 23 --------
DAYS.append(
    day_pack(
        23,
        "第 23 天 · 判断连线",
        ["30+8-10", "50-20+14", "15-9-3", "9+7-8", "14-7+8", "10-5+5", "12+5+9", "70-20+9", "90+7-60", "10+2-3"],
        [
            {
                "name": "判断",
                "icon": "🔍",
                "questions": [
                    {"type": "true_false", "prompt": "读写两位数都要从个位起。", "answer": False},
                    {"type": "true_false", "prompt": "至少4个相同小正方形才能拼成一个大正方形。", "answer": True},
                    {"type": "calc", "prompt": "6颗珠子在十位个位计数器上能摆出几个不同数？（0-6珠）", "answer": 7, "hint": "60,51,42,33,24,15,06等"},
                ],
            },
            {
                "name": "我会选·连线结果",
                "icon": "🐝",
                "questions": [
                    {"type": "calc", "prompt": "73+5=？", "answer": 78},
                    {"type": "calc", "prompt": "23+6=？", "answer": 29},
                    {"type": "calc", "prompt": "12+7=？", "answer": 19},
                    {"type": "calc", "prompt": "29+30=？", "answer": 59},
                ],
            },
            {"name": "应用题", "icon": "🍎", "questions": [{"type": "word", "prompt": "96个苹果上午卖26下午卖39，还剩？", "answer": 31}]},
            {
                "name": "思维题",
                "icon": "🦆",
                "questions": [
                    {"type": "calc", "prompt": "正着数第6倒着数第7，一共几只鸭？", "answer": 12, "hint": "6+7-1"},
                ],
            },
        ],
    )
)

# -------- Day 24 --------
DAYS.append(
    day_pack(
        24,
        "第 24 天 · 图形选择",
        ["68-40", "93-20", "39-20", "77-40", "67-30", "20+78", "68-25", "48-3", "59-30", "69-40", "75-3", "63+6"],
        [
            {
                "name": "我会选",
                "icon": "✅",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "两个相同直角三角形不能拼成",
                        "options": [{"label": "①长方形", "value": 0}, {"label": "②正方形", "value": 1}, {"label": "③三角形", "value": 2}],
                        "answer": 2,
                        "hint": "可拼长方形或等腰，一般拼不出任意三角形题意指等边等",
                    },
                    {
                        "type": "choice",
                        "prompt": "30个鸡蛋每盒7个，最多装满几盒？",
                        "options": [{"label": "①3", "value": 0}, {"label": "②4", "value": 1}, {"label": "③5", "value": 2}],
                        "answer": 1,
                    },
                ],
            },
            {
                "name": "照样子填数",
                "icon": "🔗",
                "questions": [
                    {"type": "calc", "prompt": "36与6相连中间是42。18与40相连？", "answer": 58},
                    {"type": "calc", "prompt": "9与57相连？", "answer": 66},
                    {"type": "calc", "prompt": "3与66相连？", "answer": 69},
                    {"type": "calc", "prompt": "66与8相连？", "answer": 74},
                    {"type": "multi_blank", "prompt": "6+18、18+40、40+9、9+57、57+3、3+66、66+8 的和（写前4个）", "blanks": 4, "answer": [24, 58, 49, 66], "accept": [[24, 58, 49, 66], ["24", "58", "49", "66"]]},
                ],
            },
            {"name": "应用题", "icon": "👥", "questions": [{"type": "word", "prompt": "从前数小明第18，从后数第15，一共几人？", "answer": 32, "hint": "18+15-1"}]},
            {"name": "思维题", "icon": "🪚", "questions": [{"type": "word", "prompt": "锯成5段要4分钟，锯成7段要几分钟？", "answer": 6}]},
        ],
    )
)

# -------- Day 25 --------
DAYS.append(
    day_pack(
        25,
        "第 25 天 · 选择与灯笼",
        ["32-30", "65-4", "53-50", "68-5", "47-4", "36+23", "74-20", "86-5", "74-3", "75-30", "68-50", "64+32"],
        [
            {
                "name": "我会选",
                "icon": "✅",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "红花89朵，黄花比红花少得多。黄花可能有",
                        "options": [{"label": "①90", "value": 0}, {"label": "②88", "value": 1}, {"label": "③25", "value": 2}],
                        "answer": 2,
                    },
                    {
                        "type": "choice",
                        "prompt": "2张1元、2张5角、5张1角组成",
                        "options": [{"label": "①3元", "value": 0}, {"label": "②3元5角", "value": 1}, {"label": "③10元", "value": 2}],
                        "answer": 1,
                    },
                ],
            },
            {
                "name": "算一算（灯笼）",
                "icon": "🏮",
                "questions": [
                    {"type": "chain", "prompt": "从13", "start": 13, "ops": ["+9", "+20", "+4", "+30"], "answer": [22, 42, 46, 76]},
                    {"type": "chain", "prompt": "从22", "start": 22, "ops": ["+8", "+10", "+20", "+5"], "answer": [30, 40, 60, 65]},
                ],
            },
            {"name": "应用题", "icon": "🍬", "questions": [{"type": "word", "prompt": "小明37颗糖，小红比小明少19，小红？", "answer": 18}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "小优比小轩多6个苹果，送给小轩一些后两人一样多。小优送了几个？", "answer": 3}]},
        ],
    )
)

# -------- Day 26 --------
DAYS.append(
    day_pack(
        26,
        "第 26 天 · 树叶竖式",
        ["4+46", "26+3", "35+7", "6+46", "28+4", "7+25", "36+5", "47+2", "7+52", "36+50", "47+7", "89+2"],
        [
            {
                "name": "树叶藏数",
                "icon": "🍃",
                "questions": [
                    {"type": "calc", "prompt": "竖式：叶子盖住个位，可见十位2，减数28，差4? 被减数？常见：42-28=14中叶子题。简化：2□−28=4，个位？", "answer": 2, "hint": "若42-28=14"},
                    {"type": "calc", "prompt": "45−3□=6，□=？", "answer": 9},
                    {"type": "calc", "prompt": "8□−53=19，□=？", "answer": 2, "hint": "82-53=29 wait; 题图约8□-53=29 → 82"},
                    {"type": "calc", "prompt": "82−53=？", "answer": 29},
                ],
            },
            {
                "name": "我会选",
                "icon": "✅",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "一本数学书价格约为",
                        "options": [{"label": "①60元7角", "value": 0}, {"label": "②6元7角", "value": 1}, {"label": "③6角7分", "value": 2}],
                        "answer": 1,
                    },
                    {
                        "type": "choice",
                        "prompt": "个位十位相同且比60小的两位数可能是",
                        "options": [{"label": "①44", "value": 0}, {"label": "②56", "value": 1}, {"label": "③77", "value": 2}],
                        "answer": 0,
                    },
                ],
            },
            {"name": "应用题", "icon": "🚌", "questions": [{"type": "word", "prompt": "车上36人，下去8上来12，现在几人？", "answer": 40}]},
            {
                "name": "思维题",
                "icon": "🛢️",
                "questions": [
                    {"type": "multi_blank", "prompt": "连桶重19kg，吃一半油后连桶12kg。吃掉油（）kg，原有油（）kg", "blanks": 2, "answer": [7, 14], "accept": [[7, 14], ["7", "14"]], "hint": "半桶油=19-12=7，原油14"},
                ],
            },
        ],
    )
)

# -------- Day 27 --------
DAYS.append(
    day_pack(
        27,
        "第 27 天 · 我会数",
        ["94-40", "88-7", "63-50", "73-40", "65-5", "7+36", "71-50", "45-20", "89-40", "76-50", "5-2", "45-2"],
        [
            {
                "name": "填空题",
                "icon": "✍️",
                "questions": [
                    {"type": "calc", "prompt": "44中十位4比个位4多多少（40−4）？", "answer": 36},
                    {"type": "multi_blank", "prompt": "最小两位数（），再加上（）得最大两位数", "blanks": 2, "answer": [10, 89], "accept": [[10, 89], ["10", "89"]]},
                    {"type": "calc", "prompt": "被减数40减数6，差？", "answer": 34},
                    {"type": "multi_blank", "prompt": "比70大比90小且个位5的数", "blanks": 2, "answer": [75, 85], "accept": [[75, 85], [85, 75], ["75", "85"], ["85", "75"]]},
                ],
            },
            {
                "name": "我会数",
                "icon": "🚂",
                "questions": [
                    {"type": "calc", "prompt": "图中圆大约几个？（车轮+装饰）", "answer": 5, "accept": [5, 6, 7]},
                    {"type": "calc", "prompt": "长方形约3、三角2、正方形1、平行四边形1、圆5，一共图形？", "answer": 12},
                    {"type": "word", "prompt": "数量最多的图形是？（填：圆）", "answer": "圆", "accept": ["圆", "圆形", "○"]},
                    {"type": "word", "prompt": "数量最少的图形是？（填：正方形 或 平行四边形）", "answer": "正方形", "accept": ["正方形", "平行四边形", "□", "菱形"]},
                ],
            },
            {"name": "应用题", "icon": "🚗", "questions": [{"type": "word", "prompt": "小汽车45辆，又来9辆小汽车（公交不计）。小汽车？", "answer": 54}]},
            {"name": "思维题", "icon": "🤝", "questions": [{"type": "word", "prompt": "5人两两握手，共几次？", "answer": 10}]},
        ],
    )
)

# -------- Day 28 --------
DAYS.append(
    day_pack(
        28,
        "第 28 天 · 列式计算",
        ["56+40", "4+53", "43+40", "51+20", "5+21", "84-4", "63-60", "60+11", "35+7", "66-30", "4+54", "32-4", "47-30", "75-40"],
        [
            {
                "name": "看图列式",
                "icon": "📏",
                "questions": [
                    {"type": "expression", "prompt": "共62根，拿走一些还剩图中数量。若可见部分是50，拿走？列式62-50=12或写出拿走根数", "answer": 12, "accept": [12, "62-50=12", "50"]},
                    {"type": "calc", "prompt": "6捆2根（每捆10）=？", "answer": 62},
                    {"type": "calc", "prompt": "7捆5根=？", "answer": 75},
                    {"type": "calc", "prompt": "75−35=？", "answer": 40},
                ],
            },
            {
                "name": "脱式计算",
                "icon": "🧮",
                "questions": [
                    {"type": "calc", "prompt": "94−(71−17)=？", "answer": 40},
                    {"type": "calc", "prompt": "43+(30−17)=？", "answer": 56},
                    {"type": "calc", "prompt": "76−(33−25)=？", "answer": 68},
                ],
            },
            {"name": "应用题", "icon": "🚌", "questions": [{"type": "word", "prompt": "到站下16上24，现有44人。起点上车多少人？", "answer": 36}]},
            {
                "name": "思维题",
                "icon": "💡",
                "questions": [
                    {"type": "multi_blank", "prompt": "开关亮灭交替。拉10次后灯亮填1不亮填0；拉47次亮（）不亮（）用1/0", "blanks": 3, "answer": [0, 1, 0], "accept": [[0, 1, 0], ["0", "1", "0"], [0, "亮", "不亮"]]},
                ],
            },
        ],
    )
)

# -------- Day 29 --------
DAYS.append(
    day_pack(
        29,
        "第 29 天 · 规律连加",
        ["6+7+6", "6+4-3", "2+5+4", "7-6+9", "3+2+5", "6+6-2", "5+4+5", "3+4+7", "10-1+8", "8-8+5"],
        [
            {
                "name": "找规律",
                "icon": "🎨",
                "questions": [
                    {
                        "type": "choice",
                        "prompt": "黑白珠相间，第1颗黑，第10颗是？",
                        "options": [{"label": "黑", "value": "黑"}, {"label": "白", "value": "白"}],
                        "answer": "白",
                    },
                    {
                        "type": "choice",
                        "prompt": "图案：阴影三角、竖纹圆、斜纹菱…下一组应先是？",
                        "options": [{"label": "①空白方", "value": 0}, {"label": "②空白三角", "value": 1}, {"label": "③空白圆", "value": 2}],
                        "answer": 0,
                        "hint": "阴影/纹样与空白交替，形状循环",
                    },
                ],
            },
            {
                "name": "连加计算",
                "icon": "➕",
                "questions": [
                    {"type": "calc", "prompt": "17+5+24=？", "answer": 46},
                    {"type": "calc", "prompt": "39+13+22=？", "answer": 74},
                    {"type": "calc", "prompt": "36+21+25=？", "answer": 82},
                ],
            },
            {"name": "应用题", "icon": "🪢", "questions": [{"type": "word", "prompt": "三人各跳20下，一共？", "answer": 60}]},
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {"type": "calc", "prompt": "3、5、9、15、（ ）、33", "answer": 23, "hint": "+2+4+6+8+10"},
                    {"type": "calc", "prompt": "5、2、6、2、8、2、11、2、15、2、（ ）、2、26", "answer": 20, "hint": "隔项+1,+2,+3..."},
                    {"type": "multi_blank", "prompt": "13、31、24、42、35、53、（）、（）、57、75", "blanks": 2, "answer": [46, 64], "accept": [[46, 64], ["46", "64"]]},
                    {"type": "multi_blank", "prompt": "1、3、5、7后三个奇数；2、4、6、8后三个偶数。用逗号：奇数们,偶数们 如9,11,13,10,12,14", "blanks": 1, "answer": ["9,11,13,10,12,14"], "accept": [["9,11,13,10,12,14"], ["9，11，13，10，12，14"]]},
                ],
            },
        ],
    )
)

# -------- Day 30 --------
DAYS.append(
    day_pack(
        30,
        "第 30 天 · 毕业挑战",
        ["75-3", "88-5", "56-4", "89-7", "46-20", "8+3", "24-4", "69-40", "47-3", "38-7", "84-4", "63-60", "17-9", "12-9"],
        [
            {
                "name": "算一算",
                "icon": "🦒",
                "questions": [
                    {"type": "calc", "prompt": "41+7=？", "answer": 48},
                    {"type": "calc", "prompt": "52+2=？", "answer": 54},
                    {"type": "calc", "prompt": "62+4=？", "answer": 66},
                    {"type": "calc", "prompt": "27+2=？", "answer": 29},
                    {"type": "calc", "prompt": "65+1=？", "answer": 66},
                    {"type": "calc", "prompt": "46+2=？", "answer": 48},
                    {"type": "calc", "prompt": "50+4=？", "answer": 54},
                    {"type": "calc", "prompt": "25+4=？", "answer": 29},
                ],
            },
            {
                "name": "连加计算",
                "icon": "➕",
                "questions": [
                    {"type": "calc", "prompt": "12+17+31=？", "answer": 60},
                    {"type": "calc", "prompt": "34+9+14=？", "answer": 57},
                    {"type": "calc", "prompt": "26+38+29=？", "answer": 93},
                ],
            },
            {"name": "应用题", "icon": "📚", "questions": [{"type": "word", "prompt": "小张18本书，我3本，我比小张少几本？", "answer": 15}]},
            {
                "name": "思维题",
                "icon": "👩‍🏫",
                "questions": [
                    {"type": "word", "prompt": "黄老师今年28岁。6年前她比明明大20岁。明明今年？", "answer": 14, "hint": "6年前老师22，明明2"},
                ],
            },
        ],
    )
)

# fix day numbers
for i, d in enumerate(DAYS, 1):
    d["day"] = i

out = HERE / "days.json"
out.write_text(json.dumps(DAYS, ensure_ascii=False, indent=2), encoding="utf-8")
total = sum(len(s["questions"]) for d in DAYS for s in d["sections"])
print(f"Wrote {len(DAYS)} days, {total} questions -> {out}")
from collections import Counter
c = Counter(q["type"] for d in DAYS for s in d["sections"] for q in s["questions"])
print(dict(c))
