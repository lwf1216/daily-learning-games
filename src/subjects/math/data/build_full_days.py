# -*- coding: utf-8 -*-
"""Generate complete 30-day question bank from Maths Class1 PDF content."""
from __future__ import annotations

import json
import re
from pathlib import Path

OUT = Path(__file__).with_name("days.json")


def calc_expr(expr: str) -> int:
    e = re.sub(r"\s+", "", expr.replace("=", ""))
    nums = re.findall(r"[+\-]?\d+", e if e[:1] in "+-" else "+" + e)
    return sum(int(n) for n in nums)


def oral(items: list[str], day: int) -> list[dict]:
    qs = []
    for i, expr in enumerate(items, 1):
        clean = re.sub(r"\s+", "", expr)
        ans = calc_expr(clean)
        body = re.sub(r"([+\-])", r" \1 ", clean)
        body = re.sub(r"\s+", " ", body).strip()
        qs.append(
            {
                "id": f"d{day}-s1-q{i}",
                "type": "calc",
                "prompt": f"{body} =",
                "answer": ans,
                "hint": "从左到右一步一步算",
            }
        )
    return qs


def Q(day: int, sec: int, i: int, **kw) -> dict:
    kw["id"] = f"d{day}-s{sec}-q{i}"
    return kw


def day_pack(day: int, title: str, oral_list: list[str], sections: list[dict]) -> dict:
    secs = [
        {"id": "s1", "name": "口算", "icon": "⚡", "questions": oral(oral_list, day)},
    ]
    for si, sec in enumerate(sections, 2):
        for qi, q in enumerate(sec["questions"], 1):
            q["id"] = f"d{day}-s{si}-q{qi}"
        secs.append({"id": f"s{si}", "name": sec["name"], "icon": sec.get("icon", "📘"), "questions": sec["questions"]})
    return {"day": day, "title": title, "sections": secs}


DAYS: list[dict] = []

# -------- Day 1 --------
DAYS.append(
    day_pack(
        1,
        "第 1 天 · 启程",
        ["3+48", "4+23", "7+5", "100-50", "9+5-5", "50+20-30", "43+9", "50+30", "65+7", "33+6", "19-8-2", "62-50+7"],
        [
            {
                "name": "比大小",
                "icon": "⚖️",
                "questions": [
                    {"type": "compare", "prompt": "19−6 ○ 12", "answer": ">", "hint": "13>12"},
                    {"type": "compare", "prompt": "3+8 ○ 19−6", "answer": "<"},
                    {"type": "compare", "prompt": "16+3 ○ 12+7", "answer": "="},
                    {"type": "compare", "prompt": "14−6 ○ 10", "answer": "<"},
                    {"type": "compare", "prompt": "18 ○ 18−8", "answer": ">"},
                    {"type": "compare", "prompt": "14−3 ○ 7+3", "answer": ">"},
                ],
            },
            {
                "name": "速算夺红旗",
                "icon": "🏁",
                "questions": [
                    {"type": "chain", "prompt": "从 12 开始", "start": 12, "ops": ["+2", "+10", "+20", "+4", "+30"], "answer": [14, 24, 44, 48, 78]},
                    {"type": "chain", "prompt": "从 4 开始", "start": 4, "ops": ["+20", "+10", "+4", "+1", "+40"], "answer": [24, 34, 38, 39, 79]},
                    {"type": "chain", "prompt": "从 30 开始", "start": 30, "ops": ["+30", "+2", "+6", "+1", "+30"], "answer": [60, 62, 68, 69, 99]},
                ],
            },
            {
                "name": "应用题",
                "icon": "🚌",
                "questions": [
                    {"type": "word", "prompt": "一年级 98 人去旅游。第一辆车坐 40 人，第二辆坐 55 人。还有多少人不能上车？", "answer": 3, "hint": "98-40-55"},
                ],
            },
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {"type": "word", "prompt": "小宏上 1 层时爸爸上 2 层。小宏上到 3 楼时，爸爸上到几楼？", "answer": 6, "accept": [6, "6楼", "6层"]},
                ],
            },
        ],
    )
)

# -------- Day 2 --------
DAYS.append(
    day_pack(
        2,
        "第 2 天 · 钱币与火车",
        ["30+47", "4+23", "24+9", "3+46", "45-5", "12-9+18", "70-60", "41+6", "40-8", "6+5-4", "83-30", "60-20-40"],
        [
            {
                "name": "元角分加减",
                "icon": "💰",
                "questions": [
                    {"type": "word", "prompt": "7角9分+5角1分=？(可写1元2角)", "answer": "1元2角", "accept": ["1元2角", "12角", "120分"]},
                    {"type": "word", "prompt": "3元1角+5元2角=？", "answer": "8元3角", "accept": ["8元3角"]},
                    {"type": "word", "prompt": "8元+9元=？", "answer": 17, "accept": [17, "17元"]},
                    {"type": "word", "prompt": "6角2分-1角2分=？", "answer": "5角", "accept": ["5角", "50分"]},
                    {"type": "word", "prompt": "6元1角-3元8角=？", "answer": "2元3角", "accept": ["2元3角"]},
                    {"type": "word", "prompt": "8角-8分=？", "answer": "7角2分", "accept": ["7角2分", "72分"]},
                ],
            },
            {
                "name": "开火车",
                "icon": "🚂",
                "questions": [
                    {"type": "chain", "prompt": "起点 20", "start": 20, "ops": ["+40", "-10", "+30", "-50", "+70"], "answer": [60, 50, 80, 30, 100]},
                    {"type": "chain", "prompt": "起点 70", "start": 70, "ops": ["-40", "+20", "-10", "+30", "-60"], "answer": [30, 50, 40, 70, 10]},
                ],
            },
            {"name": "应用题", "icon": "⭐", "questions": [{"type": "word", "prompt": "小红第一次剪 15 个五角星，第二次同样多。两次一共？", "answer": 30}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "14 人排队，从左数红红第 4，从右数明明第 4。两人之间几人？", "answer": 6}]},
        ],
    )
)

# -------- Day 3 --------
DAYS.append(
    day_pack(
        3,
        "第 3 天 · 数位",
        ["20+3", "5+31", "53+20", "8+51", "28+9+5", "89-7", "20+87", "3+43", "8+51", "81-7", "70-2+9", "93-60"],
        [
            {
                "name": "想一想填一填",
                "icon": "🧩",
                "questions": [
                    {"type": "calc", "prompt": "65−3=？", "answer": 62},
                    {"type": "calc", "prompt": "36−8=？", "answer": 28},
                    {"type": "calc", "prompt": "25+20=？", "answer": 45},
                ],
            },
            {
                "name": "填空题",
                "icon": "✍️",
                "questions": [
                    {"type": "multi_blank", "prompt": "100最高位是（）位；1在（）位，表示（）个（）", "blanks": 4, "answer": ["百", "百", 1, "百"], "accept": [["百", "百", "1", "百"], ["百", "百", 1, "百"]]},
                    {"type": "multi_blank", "prompt": "46个位是（），表示（）；十位是（），4表示（）", "blanks": 4, "answer": [6, "6个一", 4, "4个十"], "accept": [[6, "6个一", 4, "4个十"], ["6", "6个一", "4", "4个十"], [6, 6, 4, 40]]},
                    {"type": "calc", "prompt": "两位数，十位比个位大4，个位比1小。这个数是？", "answer": 40},
                    {"type": "multi_blank", "prompt": "比10大比20小有（）个；个位十位相同的是（）", "blanks": 2, "answer": [9, 11], "accept": [[9, 11], ["9", "11"]]},
                ],
            },
            {"name": "应用题", "icon": "🏃", "questions": [{"type": "word", "prompt": "小明前面4人后面4人，一队共几人？", "answer": 9}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "小强7岁老师30岁。5年后老师比小强大几岁？", "answer": 23}]},
        ],
    )
)

# -------- Day 4 --------
DAYS.append(
    day_pack(
        4,
        "第 4 天 · 前后数",
        ["1+90", "20-8", "66+5", "38+3+4", "7-7", "68-6", "31-5", "89-2", "60-40", "41-20-7", "45-3", "20+6"],
        [
            {
                "name": "填空题",
                "icon": "✍️",
                "questions": [
                    {"type": "multi_blank", "prompt": "七十写作（），比最大两位数小（）", "blanks": 2, "answer": [70, 29], "accept": [[70, 29], ["70", "29"]]},
                    {"type": "multi_blank", "prompt": "49前（）后（）；与99相邻（）（）；34后面第三个数（）", "blanks": 5, "answer": [48, 50, 98, 100, 37], "accept": [[48, 50, 98, 100, 37], ["48", "50", "98", "100", "37"]]},
                    {"type": "multi_blank", "prompt": "80连续减4四次：", "blanks": 4, "answer": [76, 72, 68, 64], "accept": [[76, 72, 68, 64], ["76", "72", "68", "64"]]},
                    {"type": "multi_blank", "prompt": "80前面4个数（从大到小）", "blanks": 4, "answer": [79, 78, 77, 76], "accept": [[79, 78, 77, 76], ["79", "78", "77", "76"]]},
                ],
            },
            {
                "name": "圆盘算",
                "icon": "🍩",
                "questions": [
                    {"type": "calc", "prompt": "79−1=？", "answer": 78},
                    {"type": "calc", "prompt": "79−8=？", "answer": 71},
                    {"type": "calc", "prompt": "51−5=？", "answer": 46},
                    {"type": "calc", "prompt": "56−5=？", "answer": 51},
                    {"type": "calc", "prompt": "65−5=？", "answer": 60},
                    {"type": "calc", "prompt": "86−5=？", "answer": 81},
                ],
            },
            {"name": "应用题", "icon": "🍪", "questions": [{"type": "word", "prompt": "买18个○，爸爸吃4个，我吃3个，还剩几个○？", "answer": 11}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "正着报数报7，倒着报9，一共几人？", "answer": 15, "hint": "7+9-1"}]},
        ],
    )
)

# -------- Day 5 --------
DAYS.append(
    day_pack(
        5,
        "第 5 天 · 钱币比较",
        ["73-40", "8+45", "12-7", "14-5", "63+20", "38+3+4", "28+54", "15-5", "18-9", "59-9", "19+5", "41-9+5"],
        [
            {
                "name": "钱币比大小",
                "icon": "💵",
                "questions": [
                    {"type": "compare", "prompt": "5角 ○ 5元", "answer": "<"},
                    {"type": "compare", "prompt": "6元 ○ 5元9角", "answer": ">"},
                    {"type": "compare", "prompt": "9元9角 ○ 9角9分", "answer": ">"},
                    {"type": "compare", "prompt": "70分 ○ 7元", "answer": "<"},
                    {"type": "compare", "prompt": "1元 ○ 100分", "answer": "="},
                    {"type": "compare", "prompt": "1元8角 ○ 18角", "answer": "="},
                    {"type": "compare", "prompt": "5元 ○ 7元", "answer": "<"},
                    {"type": "compare", "prompt": "30角 ○ 1元", "answer": ">"},
                    {"type": "compare", "prompt": "7元9角 ○ 9元7角", "answer": "<"},
                ],
            },
            {
                "name": "按规律填数",
                "icon": "🔢",
                "questions": [
                    {"type": "pattern", "prompt": "70、75、80、__、__、__", "answer": [85, 90, 95], "accept": [[85, 90, 95], ["85", "90", "95"]]},
                    {"type": "pattern", "prompt": "67、57、47、__、__、__", "answer": [37, 27, 17], "accept": [[37, 27, 17], ["37", "27", "17"]]},
                    {"type": "pattern", "prompt": "7、14、21、__、__、__", "answer": [28, 35, 42], "accept": [[28, 35, 42], ["28", "35", "42"]]},
                ],
            },
            {"name": "应用题", "icon": "🦆", "questions": [{"type": "word", "prompt": "鹅13只，鸭比鹅多12只。鸭有几只？", "answer": 25}]},
            {
                "name": "思维题",
                "icon": "🧠",
                "questions": [
                    {
                        "type": "multi_blank",
                        "prompt": "用2、3、4、5各一次填：( )+( )−( )=( )",
                        "blanks": 4,
                        "answer": [5, 2, 3, 4],
                        "accept": [[5, 2, 3, 4], [5, 2, 4, 3], [2, 5, 3, 4], [2, 5, 4, 3], [4, 3, 2, 5], [3, 4, 2, 5], ["5", "2", "3", "4"], ["4", "3", "2", "5"]],
                    }
                ],
            },
        ],
    )
)

# -------- Day 6 --------
DAYS.append(
    day_pack(
        6,
        "第 6 天 · 排序连线",
        ["23+6", "65+30", "23+5", "10-1", "81-6", "37-2-2", "37+50", "80-40", "32+3", "95-90", "33+4", "89-1+1"],
        [
            {
                "name": "从大到小排",
                "icon": "📊",
                "questions": [
                    {
                        "type": "order",
                        "prompt": "先算再从大到小点选",
                        "items": [
                            {"id": "a", "text": "13−6"},
                            {"id": "b", "text": "17−9"},
                            {"id": "c", "text": "11−8"},
                            {"id": "d", "text": "15−6"},
                            {"id": "e", "text": "12−8"},
                        ],
                        "answer": ["d", "a", "b", "e", "c"],
                    }
                ],
            },
            {
                "name": "连一连",
                "icon": "🏀",
                "questions": [
                    {
                        "type": "match",
                        "prompt": "得数相同连起来",
                        "left": [
                            {"id": "l1", "text": "11−8"},
                            {"id": "l2", "text": "15−7"},
                            {"id": "l3", "text": "16−9"},
                            {"id": "l4", "text": "12−6"},
                            {"id": "l5", "text": "13−8"},
                            {"id": "l6", "text": "11−7"},
                        ],
                        "right": [
                            {"id": "r1", "text": "16−8"},
                            {"id": "r2", "text": "14−7"},
                            {"id": "r3", "text": "12−7"},
                            {"id": "r4", "text": "13−9"},
                            {"id": "r5", "text": "10−7"},
                            {"id": "r6", "text": "14−8"},
                        ],
                        "answer": [["l1", "r4"], ["l2", "r1"], ["l3", "r3"], ["l4", "r2"], ["l5", "r5"], ["l6", "r6"]],
                    }
                ],
            },
            {"name": "应用题", "icon": "📚", "questions": [{"type": "word", "prompt": "书96本，第一周借28，第二周借30，还剩？", "answer": 38}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "multi_blank", "prompt": "15、11、13、13、11、15、9、17、7、（）、（）、21、3", "blanks": 2, "answer": [19, 5], "accept": [[19, 5], ["19", "5"]]}]},
        ],
    )
)

# -------- Day 7 --------
DAYS.append(
    day_pack(
        7,
        "第 7 天 · 十和一",
        ["100-40", "46+40", "21+64", "51-40", "50-22", "52+20+8", "86-83", "54+39", "55+27", "52+8", "78-9", "67-6+5"],
        [
            {
                "name": "数一数",
                "icon": "🥚",
                "questions": [
                    {"type": "multi_blank", "prompt": "2个十和5个一：几个十、几个一、合起来", "blanks": 3, "answer": [2, 5, 25], "accept": [[2, 5, 25], ["2", "5", "25"]], "visual": "2盒+5个"},
                    {"type": "multi_blank", "prompt": "5个十和8个一：几个十、几个一、合起来", "blanks": 3, "answer": [5, 8, 58], "accept": [[5, 8, 58], ["5", "8", "58"]]},
                ],
            },
            {
                "name": "宫格填数",
                "icon": "🔲",
                "questions": [
                    {"type": "multi_blank", "prompt": "行21、?、23 与 41、?、43，两问号", "blanks": 2, "answer": [22, 42], "accept": [[22, 42], ["22", "42"]]},
                    {"type": "calc", "prompt": "中心66，左边小1是？", "answer": 65},
                    {"type": "calc", "prompt": "中心45，右边大1是？", "answer": 46},
                    {"type": "calc", "prompt": "中心85，上边小10是？", "answer": 75},
                ],
            },
            {"name": "应用题", "icon": "🦋", "questions": [{"type": "word", "prompt": "花丛35只，飞走6，又来12，现在几只？", "answer": 41}]},
            {"name": "思维题", "icon": "🚌", "questions": [{"type": "word", "prompt": "车每15分钟一班。想乘9:10，到站9:20。还要等几分钟？", "answer": 5}]},
        ],
    )
)

# -------- Day 8 --------
DAYS.append(
    day_pack(
        8,
        "第 8 天 · 括号填数",
        ["93-26", "19-5", "69+6", "72+12", "97-55", "7+3+6", "16+50", "79-73", "17+73", "97-70", "76+23", "67-6+5"],
        [
            {
                "name": "算一算连一连",
                "icon": "🐶",
                "questions": [
                    {
                        "type": "match",
                        "prompt": "算式连得数",
                        "left": [
                            {"id": "l1", "text": "50+9"},
                            {"id": "l2", "text": "33−3"},
                            {"id": "l3", "text": "86−6"},
                            {"id": "l4", "text": "74−4"},
                            {"id": "l5", "text": "98−8"},
                        ],
                        "right": [
                            {"id": "r1", "text": "70"},
                            {"id": "r2", "text": "59"},
                            {"id": "r3", "text": "30"},
                            {"id": "r4", "text": "80"},
                            {"id": "r5", "text": "90"},
                        ],
                        "answer": [["l1", "r2"], ["l2", "r3"], ["l3", "r4"], ["l4", "r1"], ["l5", "r5"]],
                    }
                ],
            },
            {
                "name": "括号最大能填几",
                "icon": "➕",
                "questions": [
                    {"type": "calc", "prompt": "20>7+( ) 最大", "answer": 12},
                    {"type": "calc", "prompt": "7+( )<19 最大", "answer": 11},
                    {"type": "calc", "prompt": "11−( )>2 最大", "answer": 8},
                    {"type": "calc", "prompt": "( )+9<15 最大", "answer": 5},
                    {"type": "calc", "prompt": "20>( )+2 最大", "answer": 17},
                    {"type": "calc", "prompt": "8<13−( ) 最大", "answer": 4},
                    {"type": "calc", "prompt": "13>6+( ) 最大", "answer": 6},
                    {"type": "calc", "prompt": "6+( )<18 最大", "answer": 11},
                    {"type": "calc", "prompt": "8+( )<19 最大", "answer": 10},
                    {"type": "calc", "prompt": "( )+6<17 最大", "answer": 10},
                    {"type": "calc", "prompt": "2<11−( ) 最大", "answer": 8},
                    {"type": "calc", "prompt": "( )+8<18 最大", "answer": 9},
                ],
            },
            {"name": "应用题", "icon": "🍬", "questions": [{"type": "word", "prompt": "糖10元，付20元，找回？", "answer": 10}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "3人吃3个馒头要3分钟。9人吃9个要几分钟？", "answer": 3}]},
        ],
    )
)

# -------- Day 9 --------
DAYS.append(
    day_pack(
        9,
        "第 9 天 · 读写数",
        ["48+44", "85-23", "17+68", "14+55", "91-74", "1+3+6", "39+17", "50-7", "36-11", "46+52", "21+74", "40+40+8"],
        [
            {
                "name": "填空题",
                "icon": "✍️",
                "questions": [
                    {"type": "multi_blank", "prompt": "59：几个十、几个一、相邻两数（小的在前）", "blanks": 4, "answer": [5, 9, 58, 60], "accept": [[5, 9, 58, 60], ["5", "9", "58", "60"]]},
                    {"type": "calc", "prompt": "四十九写作？", "answer": 49},
                    {"type": "word", "prompt": "87读作？（填汉字，如八十七）", "answer": "八十七", "accept": ["八十七"]},
                    {"type": "multi_blank", "prompt": "（）个十和（）个一是49", "blanks": 2, "answer": [4, 9], "accept": [[4, 9], ["4", "9"]]},
                    {"type": "calc", "prompt": "100里面有几个十？", "answer": 10},
                    {"type": "multi_blank", "prompt": "与59相邻的两个数", "blanks": 2, "answer": [58, 60], "accept": [[58, 60], ["58", "60"]]},
                ],
            },
            {
                "name": "看图列式",
                "icon": "🎒",
                "questions": [
                    {"type": "expression", "prompt": "书包31元+球拍18元，列式如31+18=49", "answer": "31+18=49", "accept": ["31+18=49", "18+31=49", "49"]},
                    {"type": "expression", "prompt": "拖鞋12元+围巾25元", "answer": "12+25=37", "accept": ["12+25=37", "25+12=37", "37"]},
                ],
            },
            {"name": "应用题", "icon": "📖", "questions": [{"type": "word", "prompt": "图书90本，借出40本，还剩？", "answer": 50}]},
            {"name": "思维题", "icon": "🧦", "questions": [{"type": "word", "prompt": "4红4白袜子，至少摸几只保证同色一双？", "answer": 3}]},
        ],
    )
)

# -------- Day 10 --------
DAYS.append(
    day_pack(
        10,
        "第 10 天 · 图形",
        ["4+37", "29+4", "39+8", "26+7", "7+38", "31+2-4", "6+18", "40+6", "35+30", "32+8", "25+5", "20-8+4"],
        [
            {
                "name": "我会填",
                "icon": "📐",
                "questions": [
                    {"type": "multi_blank", "prompt": "长方形、正方形、三角形各几条边", "blanks": 3, "answer": [4, 4, 3], "accept": [[4, 4, 3], ["4", "4", "3"]]},
                    {"type": "multi_blank", "prompt": "摆长方形、三角形各需几根小棒", "blanks": 2, "answer": [4, 3], "accept": [[4, 3], ["4", "3"]]},
                    {"type": "multi_blank", "prompt": "硬币、红领巾、课桌面是什么形（圆/三角/长方）", "blanks": 3, "answer": ["圆", "三角", "长方"], "accept": [["圆", "三角", "长方"], ["圆形", "三角形", "长方形"], ["圆", "三角形", "长方形"]]},
                    {"type": "multi_blank", "prompt": "长方形相对边（）；正方形四条边一样（）；平行四边形相对边（）", "blanks": 3, "answer": ["相等", "长", "相等"], "accept": [["相等", "长", "相等"]]},
                ],
            },
            {
                "name": "我会数",
                "icon": "🔷",
                "questions": [
                    {"type": "calc", "prompt": "2×2方格中正方形个数（含大）", "answer": 5, "visual": "田字格"},
                    {"type": "calc", "prompt": "2×2平行四边形格子里有几个平行四边形（含大）", "answer": 5, "accept": [5, 4, 9]},
                    {"type": "calc", "prompt": "正方形画两条对角线，三角形个数", "answer": 8, "accept": [4, 8]},
                    {"type": "calc", "prompt": "大三角形被分成若干小三角形，常见层叠图共几个三角形", "answer": 6, "accept": [4, 6, 10]},
                ],
            },
            {"name": "应用题", "icon": "🌸", "questions": [{"type": "word", "prompt": "姐姐做32朵，比妹妹多8朵。两人一共？", "answer": 56}]},
            {"name": "思维题", "icon": "🧠", "questions": [{"type": "word", "prompt": "1~7间加+使和为100。写出算式", "answer": "1+23+4+5+67", "accept": ["1+23+4+5+67", "12+3+4+5+67+9"], "hint": "1+23+4+5+67=100"}]},
        ],
    )
)

print("days 1-10 defined", len(DAYS))
