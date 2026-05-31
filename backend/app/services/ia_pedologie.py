"""
Service de diagnostic pédologique par IA
Recommandation culturale basée sur les paramètres du sol
Adapté aux cultures et conditions du Cameroun
"""
from typing import Dict, List, Any

CULTURES_PAR_SOL: List[Dict[str, Any]] = [
    {
        "culture": "Cacao", "emoji": "🍫",
        "ph_min": 5.0, "ph_max": 7.0,
        "textures": ["argilo-limoneux", "limoneux", "argilo-sableux"],
        "humidites": ["modérée", "élevée"],
        "drainages": ["bon", "modéré"],
        "score_base": 90,
        "description": "Culture phare du Cameroun, idéale pour les sols profonds et bien drainés.",
        "rendement_estime": "800 à 1500 kg/ha/an",
        "periode_plantation": "Mars-Mai ou Septembre-Novembre",
        "conseils": [
            {"conseil": "Préparer le sol avec un labour profond (30-40 cm)",
             "explication": "Bêchez votre terrain sur 30 à 40 cm de profondeur. Cela ameublit la terre et permet aux racines du cacaoyer de bien se développer."},
            {"conseil": "Planter sous ombrage partiel (bananiers, acacias)",
             "explication": "Le cacao aime l'ombre quand il est jeune. Plantez des bananiers autour pour le protéger du soleil direct les 2-3 premières années."},
            {"conseil": "Espacer les plants de 3m x 3m",
             "explication": "Laissez 3 mètres entre chaque cacaoyer. À l'âge adulte chaque arbre a besoin d'espace pour bien produire."},
            {"conseil": "Apporter de la matière organique avant plantation",
             "explication": "Mélangez des feuilles mortes ou du fumier dans la terre avant de planter. Cela rend le sol plus fertile et retient mieux l'eau."},
        ],
        "amendements": "Compost ou fumier bien décomposé (10 t/ha). Chaulage si pH < 5,5.",
    },
    {
        "culture": "Café Robusta", "emoji": "☕",
        "ph_min": 5.0, "ph_max": 6.5,
        "textures": ["argilo-limoneux", "limoneux", "sableux-limoneux"],
        "humidites": ["modérée", "élevée"],
        "drainages": ["bon", "modéré"],
        "score_base": 85,
        "description": "Café adapté aux basses altitudes, rentable en région forestière.",
        "rendement_estime": "600 à 1200 kg/ha/an",
        "periode_plantation": "Début saison des pluies",
        "conseils": [
            {"conseil": "Planter en courbes de niveau sur les pentes",
             "explication": "Si votre terrain est en pente, plantez en lignes horizontales qui suivent la courbe de la colline. Cela empêche l'eau d'emporter la terre."},
            {"conseil": "Maintenir une litière végétale au sol",
             "explication": "Laissez les feuilles mortes s'accumuler autour des pieds. Cette couverture garde l'humidité et enrichit naturellement le sol."},
            {"conseil": "Apporter de l'azote après la floraison",
             "explication": "Après la floraison, apportez de l'engrais azoté (urée) pour nourrir les fruits qui se forment. Demandez les doses à votre technicien."},
        ],
        "amendements": "Compost (5 t/ha). Urée (150 kg/ha) fractionnée en 2 fois.",
    },
    {
        "culture": "Manioc", "emoji": "🌿",
        "ph_min": 4.5, "ph_max": 7.5,
        "textures": ["sableux", "sableux-limoneux", "limoneux", "argilo-sableux"],
        "humidites": ["faible", "modérée", "élevée"],
        "drainages": ["bon", "modéré", "excessif"],
        "score_base": 80,
        "description": "Culture de base très tolérante. S'adapte à la plupart des sols.",
        "rendement_estime": "15 à 35 t/ha selon la variété",
        "periode_plantation": "Début de toute saison des pluies",
        "conseils": [
            {"conseil": "Utiliser des boutures saines de 25-30 cm",
             "explication": "Coupez des morceaux de tige saine d'environ 25 à 30 cm et plantez-les en oblique dans la terre."},
            {"conseil": "Planter en billons sur sols lourds ou humides",
             "explication": "Si votre sol retient beaucoup l'eau, formez des petites buttes (billons) et plantez dessus pour éviter la pourriture."},
            {"conseil": "Sarcler 3 fois durant les 3 premiers mois",
             "explication": "Désherber 3 fois autour de vos plants pendant les 3 premiers mois. Le manioc jeune est étouffé par les mauvaises herbes."},
        ],
        "amendements": "Sol pauvre : compost (5 t/ha). NPK 15-15-15 à 200 kg/ha recommandé.",
    },
    {
        "culture": "Maïs", "emoji": "🌽",
        "ph_min": 5.5, "ph_max": 7.5,
        "textures": ["limoneux", "argilo-limoneux", "sableux-limoneux"],
        "humidites": ["modérée", "élevée"],
        "drainages": ["bon", "modéré"],
        "score_base": 85,
        "description": "Céréale de base à fort rendement. Cycle court de 3 à 4 mois.",
        "rendement_estime": "2 à 6 t/ha selon la variété",
        "periode_plantation": "Dès les premières pluies (Mars ou Août)",
        "conseils": [
            {"conseil": "Appliquer NPK 20-10-10 au semis et urée à 45 jours",
             "explication": "Au semis, mettez de l'engrais NPK 20-10-10 près des graines. 45 jours après, ajoutez de l'urée pour nourrir les épis. Ces engrais sont vendus en boutique agricole."},
            {"conseil": "Semer en lignes espacées de 75 cm, 30 cm entre plants",
             "explication": "Faites des sillons avec 75 cm entre chaque ligne. Semez les graines tous les 30 cm dans chaque ligne."},
            {"conseil": "Pratiquer la rotation avec le soja ou le niébé",
             "explication": "Après une saison de maïs, plantez du soja sur le même champ. Ces plantes enrichissent le sol en azote."},
        ],
        "amendements": "NPK 20-10-10 à 200 kg/ha. Urée 100 kg/ha à 45 jours. Chaulage si pH < 5,5.",
    },
    {
        "culture": "Banane plantain", "emoji": "🍌",
        "ph_min": 5.5, "ph_max": 7.0,
        "textures": ["argilo-limoneux", "limoneux", "argilo-sableux"],
        "humidites": ["élevée", "modérée"],
        "drainages": ["bon", "modéré"],
        "score_base": 88,
        "description": "Culture rentable à cycle court. Forte demande sur les marchés camerounais.",
        "rendement_estime": "10 à 30 t/ha",
        "periode_plantation": "Toute l'année avec eau, sinon début des pluies",
        "conseils": [
            {"conseil": "Utiliser des rejets sains de 1 à 1,5 kg",
             "explication": "Choisissez des rejets (petits plants au pied du bananier) bien formés et sans taches, pesant environ 1 à 1,5 kg."},
            {"conseil": "Planter dans des trous de 50x50x50 cm avec compost",
             "explication": "Creusez un trou de 50 cm de côté et de profondeur. Remplissez le fond avec du compost avant de planter le rejet."},
            {"conseil": "Tuteurer les plants dès la floraison",
             "explication": "À la floraison le bananier devient lourd. Plantez un bâton à côté et attachez la tige pour l'empêcher de tomber."},
        ],
        "amendements": "Fumier (15 t/ha). NPK 15-15-15 à 300 kg/ha en 3 apports.",
    },
    {
        "culture": "Palmier à huile", "emoji": "🌴",
        "ph_min": 4.0, "ph_max": 6.0,
        "textures": ["argilo-sableux", "sableux-limoneux", "limoneux"],
        "humidites": ["élevée", "modérée"],
        "drainages": ["bon", "modéré"],
        "score_base": 82,
        "description": "Culture pérenne très rentable. Fort potentiel d'export.",
        "rendement_estime": "15 à 25 t de régimes/ha/an",
        "periode_plantation": "Début saison des pluies",
        "conseils": [
            {"conseil": "Utiliser des plants certifiés de pépinière officielle",
             "explication": "Achetez uniquement à l'INRAB ou une pépinière certifiée. Les plants améliorés produisent 3 à 5 fois plus que les plants sauvages."},
            {"conseil": "Espacer à 9m x 9m en triangle équilatéral",
             "explication": "Plantez avec 9 mètres entre chaque palmier, disposés en triangle. Cette disposition maximise la lumière et le rendement."},
            {"conseil": "Éviter les zones inondables",
             "explication": "Le palmier ne supporte pas les racines dans l'eau stagnante. Évitez les bas-fonds qui restent inondés après les pluies."},
        ],
        "amendements": "Chaulage si sol acide. KCl (chlorure de potassium) essentiel pour la production.",
    },
    {
        "culture": "Arachide", "emoji": "🥜",
        "ph_min": 5.5, "ph_max": 7.0,
        "textures": ["sableux", "sableux-limoneux", "limoneux"],
        "humidites": ["faible", "modérée"],
        "drainages": ["bon", "excessif"],
        "score_base": 80,
        "description": "Légumineuse enrichissant le sol. Bonne valeur marchande locale.",
        "rendement_estime": "1 à 2,5 t/ha de gousses sèches",
        "periode_plantation": "Début de la saison des pluies",
        "conseils": [
            {"conseil": "Semer à plat sur sols bien drainants",
             "explication": "L'arachide forme ses gousses sous terre dans un sol meuble et bien drainé pour que les tiges florales y pénètrent facilement."},
            {"conseil": "Ne pas apporter d'azote (légumineuse fixatrice)",
             "explication": "L'arachide fabrique elle-même son propre azote. Mettre de l'engrais azoté (urée) serait du gaspillage et lui nuirait."},
            {"conseil": "Récolter avant les pluies tardives",
             "explication": "Si vous laissez les gousses en terre avec les dernières pluies, elles risquent de moisir et de produire une toxine dangereuse."},
        ],
        "amendements": "Chaux si pH < 5,5. Superphosphate (150 kg/ha) favorable.",
    },
    {
        "culture": "Ananas", "emoji": "🍍",
        "ph_min": 4.5, "ph_max": 5.5,
        "textures": ["sableux", "sableux-limoneux", "argilo-sableux"],
        "humidites": ["faible", "modérée"],
        "drainages": ["bon", "excessif"],
        "score_base": 83,
        "description": "Culture adaptée aux sols acides et sableux. Bonne demande locale.",
        "rendement_estime": "30 à 60 t/ha",
        "periode_plantation": "Toute l'année — cycle 18-24 mois",
        "conseils": [
            {"conseil": "Planter les couronnes ou cayeux directement",
             "explication": "Récupérez la couronne (feuilles du haut) ou les petits rejets d'un ananas. Laissez-les sécher 2 jours avant de les planter."},
            {"conseil": "Paillage recommandé pour maintenir l'humidité",
             "explication": "Étalez de la paille ou du plastique noir autour de chaque plant. Ce paillage garde l'humidité et empêche les mauvaises herbes."},
        ],
        "amendements": "Sol acide convient bien. Apport de potasse (KCl) pour la qualité des fruits.",
    },
]


def calculer_score(culture: Dict, ph: float, texture: str, humidite: str, drainage: str) -> float:
    score = culture["score_base"]
    centre = (culture["ph_min"] + culture["ph_max"]) / 2
    if culture["ph_min"] <= ph <= culture["ph_max"]:
        score += max(0, 10 - abs(ph - centre) * 5)
    else:
        score -= (abs(ph - centre) - (culture["ph_max"] - culture["ph_min"]) / 2) * 15
    if texture in culture["textures"]: score += 8
    else: score -= 12
    if humidite in culture["humidites"]: score += 6
    else: score -= 8
    if drainage in culture["drainages"]: score += 6
    else: score -= 10
    return max(0, min(100, round(score, 1)))


def analyser_sol(ph: float, texture: str, humidite: str, drainage: str, region: str = "") -> Dict:
    resultats = []
    for culture in CULTURES_PAR_SOL:
        score = calculer_score(culture, ph, texture, humidite, drainage)
        if score >= 50:
            resultats.append({**culture, "score": score})

    resultats.sort(key=lambda x: x["score"], reverse=True)

    if ph < 5.0:
        conseil_general = "Sol très acide. Chaulage fortement recommandé avant toute plantation."
        conseil_simple = "Votre terre est trop acide. Répandez de la chaux agricole (poudre blanche en sac) pour la corriger avant de planter."
    elif ph < 5.5:
        conseil_general = "Sol légèrement acide. Bon pour cacao, café, ananas. Chaulage léger pour élargir les options."
        conseil_simple = "Votre terre est un peu acide, ce qui convient bien au cacao, café et ananas."
    elif ph < 6.5:
        conseil_general = "Sol neutre. Conditions excellentes pour la majorité des cultures camerounaises."
        conseil_simple = "Excellente nouvelle ! Votre terre a le bon niveau pour la plupart des cultures du Cameroun."
    elif ph < 7.5:
        conseil_general = "Sol neutre à alcalin. Favorable au maïs, légumineuses et maraîchage."
        conseil_simple = "Votre terre convient bien au maïs, soja et légumes. Évitez le cacao et l'ananas."
    else:
        conseil_general = "Sol alcalin. Options culturales limitées. Amendement soufré recommandé."
        conseil_simple = "Votre terre est trop basique. Consultez un technicien agricole pour la corriger."

    if len(resultats) >= 5: evaluation, evaluation_label = "excellent", "Sol excellent — Très fort potentiel agricole"
    elif len(resultats) >= 3: evaluation, evaluation_label = "bon", "Sol de bonne qualité — Bon potentiel agricole"
    elif len(resultats) >= 1: evaluation, evaluation_label = "moyen", "Sol de qualité moyenne — Potentiel limité sans amendements"
    else:
        evaluation, evaluation_label = "faible", "Sol faible — Amendements nécessaires"
        resultats = [{
            "culture": "Manioc", "emoji": "🌿", "score": 55,
            "description": "Le manioc est la culture la plus tolérante aux sols difficiles.",
            "rendement_estime": "10-15 t/ha", "periode_plantation": "Dès les premières pluies",
            "conseils": [{"conseil": "Amender le sol avant plantation", "explication": "Ajoutez du compost et de la chaux avant de planter."}],
            "amendements": "Amendements lourds nécessaires : chaux + compost + engrais complet.",
        }]

    return {
        "cultures_recommandees": resultats[:5],
        "conseil_general": conseil_general,
        "conseil_simple": conseil_simple,
        "evaluation": evaluation,
        "evaluation_label": evaluation_label,
        "nb_cultures_compatibles": len(resultats),
    }
