"""Script de seed — Cours de formation AgriGenius"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models.formation import Cours, ModuleCours
from app.models import *
Base.metadata.create_all(bind=engine)

db = SessionLocal()

COURS_DATA = [
    {
        "titre": "Comprendre et améliorer son sol",
        "description": "Apprenez à connaître votre sol, mesurer son pH, améliorer sa fertilité et choisir les bons amendements pour maximiser vos rendements.",
        "filiere": "Général", "niveau": "débutant", "duree": 45, "ordre": 1,
        "modules": [
            {
                "titre": "C'est quoi un sol agricole ?",
                "contenu": """Un sol agricole est bien plus que de la simple terre. C'est un écosystème vivant composé de :

🪨 **Minéraux** (sable, limon, argile) — constituent la structure du sol
🍂 **Matière organique** (humus) — nourrit les plantes et les micro-organismes
💧 **Eau** — transporte les nutriments vers les racines
🌬️ **Air** — indispensable aux racines et aux micro-organismes
🦠 **Micro-organismes** (bactéries, champignons, vers de terre) — décomposent la matière organique

**Pourquoi c'est important ?**
Un bon sol retient l'eau sans se noyer, laisse passer l'air, contient les nutriments dont vos plantes ont besoin, et permet aux racines de se développer librement.

**Ce qu'il faut retenir :**
Votre sol, c'est votre capital. Prenez-en soin comme vous prenez soin de vos outils. Un sol bien entretenu produit plus, pendant plus longtemps, avec moins d'intrants.""",
                "ordre": 1
            },
            {
                "titre": "Mesurer et comprendre le pH",
                "contenu": """Le pH est la mesure de l'acidité de votre sol. C'est le paramètre le plus important à connaître.

**L'échelle du pH :**
- 0 à 6 → Sol acide (la majorité des sols du Cameroun)
- 7 → Sol neutre (idéal pour beaucoup de cultures)
- 8 à 14 → Sol basique (alcalin)

**Comment mesurer ?**

🛒 **Kit de test pH** (disponible en boutique agricole, ~2000 FCFA) :
1. Prenez 2 cuillères de terre à 10 cm de profondeur
2. Mélangez avec un peu d'eau distillée
3. Ajoutez le réactif du kit
4. Comparez la couleur avec le tableau fourni

🔬 **Méthode des délégués** : L'IRAD et les postes agricoles proposent des analyses de sol. C'est la méthode la plus précise.

**Que faire selon le pH ?**

| pH mesuré | Situation | Action |
|-----------|-----------|--------|
| < 5,0 | Très acide | Chaulage obligatoire (200 kg chaux/ha) |
| 5,0-5,5 | Acide | Bon pour cacao, café, ananas |
| 5,5-6,5 | Légèrement acide | Idéal — convient à tout |
| 6,5-7,5 | Neutre | Bon pour maïs, légumes, soja |
| > 7,5 | Basique | Peu courant au Cameroun |

**Attention :** Un sol trop acide bloque l'absorption des nutriments. Même si vous mettez beaucoup d'engrais, la plante ne peut pas les utiliser !""",
                "ordre": 2
            },
            {
                "titre": "Les types de sol et leurs caractéristiques",
                "contenu": """Il existe 6 grands types de sol selon leur texture (proportion de sable, limon et argile).

**Comment identifier votre texture ?**
Faites le **test du boudin** avec une poignée de terre humide :

🏜️ **Sol sableux**
- Boudin impossible, s'effrite
- Aspect : granuleux, clair
- Au Cameroun : zones sahéliennes, côtes
- Avantages : chauffe vite, bien drainé
- Inconvénients : ne retient pas l'eau ni les nutriments

🟤 **Sol sableux-limoneux**
- Boudin se forme mais se casse vite
- Texture douce avec un peu de rugosité
- Très courant dans le Centre et le Sud
- Bon équilibre général

🌟 **Sol limoneux** *(le meilleur pour l'agriculture)*
- Boudin se forme bien, un peu fragile
- Texture très douce, soyeuse
- Retient bien l'eau et les nutriments
- Rare mais excellent

🟠 **Sol argilo-sableux**
- Boudin solide, légèrement brillant
- Couleur souvent rouge-orangé (sols ferrallitiques du Sud)
- Très courant au Cameroun
- Bon pour cacao et palmier

🔴 **Sol argilo-limoneux**
- Boudin très solide
- Colle aux doigts, difficile à travailler sec
- Excellent pour la fertilité si bien travaillé

⚫ **Sol argileux**
- Boudin brillant et très solide
- Très lourd, se fissure en séchant
- Risque d'asphyxie des racines si mal drainé""",
                "ordre": 3
            },
            {
                "titre": "Améliorer son sol avec les amendements",
                "contenu": """Un amendement est tout ce qu'on ajoute au sol pour améliorer sa qualité. Il en existe deux types principaux.

**1. Les amendements organiques (matière organique)**

🌿 **Le compost** — Le meilleur amendement
- Ce que c'est : déchets végétaux décomposés (épluchures, feuilles, pailles)
- Comment le faire : Empilez vos déchets végétaux, retournez régulièrement, prêt en 2-3 mois
- Dose : 5 à 15 tonnes par hectare
- Bienfaits : améliore la structure, nourrit les micro-organismes, retient l'eau

🐄 **Le fumier** — Efficace et disponible
- Ce que c'est : déjections animales bien décomposées (bovins, caprins)
- Attention : n'utilisez jamais du fumier frais, il brûle les plants !
- Dose : 10 à 20 tonnes par hectare
- Bienfaits : enrichit en azote, phosphore, potasse

**2. Les amendements minéraux (chimiques)**

🧂 **La chaux agricole** — Pour corriger l'acidité
- Produit : Calcaire agricole ou chaux vive (en sac)
- Quand l'utiliser : si pH < 5,5
- Dose : 200 à 500 kg par hectare
- Comment : Épandez sur sol sec, avant labour, 1 mois avant la plantation

**Calendrier recommandé :**
1. 2 mois avant plantation : épandre le compost
2. 1 mois avant plantation : épandre la chaux si nécessaire
3. Au semis : apporter l'engrais de fond (NPK)
4. 45-60 jours après : apporter l'engrais de couverture (urée)""",
                "ordre": 4
            },
        ]
    },
    {
        "titre": "Culture du Cacao — De la plantation à la récolte",
        "description": "Maîtrisez toutes les étapes de la culture du cacao : choix des plants, plantation, entretien, gestion des maladies et récolte optimale.",
        "filiere": "Cacao", "niveau": "intermédiaire", "duree": 90, "ordre": 2,
        "modules": [
            {
                "titre": "Le cacao au Cameroun — Contexte et opportunités",
                "contenu": """Le Cameroun est le 5ème producteur mondial de cacao. Cette culture représente une opportunité économique majeure pour les agriculteurs du Sud, du Centre et du Sud-Ouest.

**Chiffres clés :**
- 600 000 producteurs de cacao au Cameroun
- Rendement moyen actuel : 400 kg/ha (contre 1500 kg possible)
- Prix : 1200 à 2000 FCFA/kg selon la qualité
- Durée de vie d'un verger : 25 à 30 ans

**Pourquoi les rendements sont si bas ?**
1. Plants âgés et non sélectionnés
2. Maladies non traitées (pourriture brune)
3. Manque d'entretien (taille, désherbage)
4. Absence de fertilisation
5. Récolte et fermentation mal maîtrisées

**Ce que vous allez apprendre dans ce cours :**
Avec les bonnes pratiques, vous pouvez tripler votre rendement. Ce cours vous guide étape par étape.""",
                "ordre": 1
            },
            {
                "titre": "Choisir et préparer son terrain",
                "contenu": """**Conditions idéales pour le cacao :**

🌡️ **Climat :** Zones forestières humides, 1500-2000 mm de pluie/an, température 18-30°C
🌍 **Sol :** Profond (au moins 1,5 m), bien drainé, riche en matière organique, pH 5,0-7,0
☀️ **Ombrage :** Nécessaire les 3 premières années (50% d'ombre)

**Étapes de préparation du terrain :**

**Mois 1-2 : Défrichement et nettoyage**
- Abattez les arbres indésirables mais conservez 25-30% d'ombrage naturel
- Ne brûlez pas la végétation — elle enrichit le sol en se décomposant
- Ramassez les gros souches et pierres

**Mois 2-3 : Travail du sol**
- Labour manuel ou mécanisé à 30-40 cm
- Creusez les trous de plantation (50x50x50 cm) 2 mois avant la plantation
- Remplissez les trous avec : terre de surface + compost (1 brouette) + 100g de NPK

**Mois 3 : Plantation des cultures d'ombrage**
- Plantez des bananiers (1 pour 3 cacaoyers)
- Ou des Gliricidia (arbres d'ombrage rapides)
- Espacez les arbres d'ombrage à 6x6 mètres

**Conseil pratique :** Faites le travail de préparation au début de la petite saison sèche pour que les trous aient le temps de s'enrichir avant la grande saison des pluies.""",
                "ordre": 2
            },
            {
                "titre": "Plantation et entretien",
                "contenu": """**Choix des plants :**

Trois options, de la moins à la plus recommandée :

❌ **Plants sauvages** — Déconseillé
Rendement imprévisible, susceptibles aux maladies

⚠️ **Plants issus de vos propres cabosses** — Acceptable
Prenez les cabosses sur vos meilleurs arbres seulement

✅ **Plants certifiés IRAD/SODECAO** — Fortement recommandé
- Variétés hybrides résistantes (IMC67, UPA402, T85/799)
- Rendement 3x supérieur
- Contact IRAD : demandez à votre délégué agricole

**Densité de plantation :**
- Écartement standard : 3m x 3m = 1111 plants/ha
- Écartement amélioré : 2,5m x 2,5m = 1600 plants/ha (si irrigation)

**Entretien mensuel :**

🗓️ **Chaque mois :**
- Désherbage autour des jeunes plants (50 cm de rayon)
- Inspection pour détecter les maladies
- Ramassage et enfouissement des cabosses malades

🗓️ **Tous les 3 mois :**
- Fertilisation : 100g NPK 20-10-10 par plant
- Taille de formation (enlever les branches basses, les gourmands)

🗓️ **Deux fois par an :**
- Taille sanitaire (éliminer branches mortes et malades)
- Traitement préventif anti-Phytophthora (bouillie bordelaise)""",
                "ordre": 3
            },
            {
                "titre": "Récolte, fermentation et séchage",
                "contenu": """La qualité finale de votre cacao dépend à 80% de la récolte et de la post-récolte.

**Identifier les cabosses mûres :**

🟡 **Mûre :** Cabosse jaune, orange ou rouge selon la variété. La cabosse sonne creux quand vous frappez.
🟢 **Immature :** Verte, pas encore mûre — attendez !
⬛ **Trop mûre :** Noire ou très foncée — récoltez immédiatement pour éviter la germination

**La récolte :**
- Fréquence : toutes les 2 semaines pendant la campagne
- Outil : sécateur bien aiguisé ou cabosseur
- Coupez le pédoncule de la cabosse, pas la branche
- N'arrachez jamais les cabosses à la main (endommage le coussin floral)

**Ouverture et extraction :**
- Cassez les cabosses dans les 3-5 jours après récolte
- Utilisez une pierre ou un bois, pas une machette (évite de couper les fèves)
- Extrayez les fèves avec leur mucilage (pulpe blanche)

**La fermentation — ÉTAPE CRUCIALE :**
C'est ce qui développe les arômes du chocolat.

1. Mettez les fèves en tas ou dans des caisses en bois
2. Couvrez avec des feuilles de bananier
3. Durée : 5-7 jours
4. Retournez les fèves à 48h et 96h

⚠️ Une fève mal fermentée vaut 30-40% de moins sur le marché !

**Séchage :**
- Durée : 7-10 jours au soleil
- Étalez en couche mince (4-5 cm max)
- Retournez régulièrement
- Taux d'humidité final visé : 7-8%
- Test : la fève doit craquer quand on la plie""",
                "ordre": 4
            },
        ]
    },
    {
        "titre": "Maraîchage — Tomates, Légumes-feuilles et Gombo",
        "description": "Guide complet pour cultiver les légumes les plus rentables du marché camerounais avec les bonnes techniques de production.",
        "filiere": "Maraîchage", "niveau": "débutant", "duree": 60, "ordre": 3,
        "modules": [
            {
                "titre": "Introduction au maraîchage rentable",
                "contenu": """Le maraîchage est l'une des activités agricoles les plus rentables au Cameroun, surtout en zone péri-urbaine.

**Pourquoi se lancer ?**
✅ Cycles courts (2-3 mois) = revenus rapides
✅ Forte demande locale toute l'année
✅ Possible sur petites surfaces (même 500 m²)
✅ Peut se pratiquer en saison sèche avec irrigation

**Les cultures les plus rentables au Cameroun :**

| Culture | Durée | Rendement | Prix moyen |
|---------|-------|-----------|-----------|
| Tomate | 90 jours | 20-40 t/ha | 200-500 FCFA/kg |
| Légumes-feuilles | 30-45 jours | 5-15 t/ha | 500-1000 FCFA/botte |
| Gombo | 60-75 jours | 8-15 t/ha | 400-800 FCFA/kg |
| Piment | 90-120 jours | 5-10 t/ha | 1000-3000 FCFA/kg |
| Aubergine | 90 jours | 15-25 t/ha | 300-600 FCFA/kg |

**Ce qu'il faut pour commencer :**
- Un terrain plat (ou en pente légère) avec accès à l'eau
- Graines ou plants certifiés
- Arrosoir ou système d'irrigation simple
- Engrais et produits phytosanitaires de base
- Budget de démarrage : 50 000 à 200 000 FCFA selon la surface""",
                "ordre": 1
            },
            {
                "titre": "Préparation du sol et pépinière",
                "contenu": """**Préparation du terrain :**

🔧 **Labour profond (30 cm) :**
Retournez complètement votre terrain. Éliminez toutes les mauvaises herbes avec leurs racines.

🏗️ **Formation des planches :**
- Largeur : 1 mètre (pour pouvoir travailler des deux côtés)
- Longueur : selon votre terrain
- Hauteur : 20-25 cm au-dessus du sol
- Allées entre planches : 40-50 cm

🌿 **Enrichissement du sol :**
Par planche de 10 m² :
- 2 brouettes de compost ou fumier bien décomposé
- 200g de NPK 15-15-15
- Mélangez bien avec la terre

**La pépinière (pour la tomate et l'aubergine) :**

Pourquoi faire une pépinière ?
- Économise les semences (coûteuses)
- Sélectionne les meilleurs plants
- Protège les jeunes plants

Étapes :
1. Préparez une petite planche de 1m x 2m
2. Semez en lignes espacées de 10 cm
3. Recouvrez légèrement de terre fine
4. Arrosez en pluie fine matin et soir
5. Couvrez d'une ombrière ou feuilles de palmier

À 3-4 semaines, transplantez quand les plants ont 15-20 cm.

**Semis direct (pour gombo, légumes-feuilles) :**
Semez directement sur les planches sans pépinière. Plus simple mais utilise plus de semences.""",
                "ordre": 2
            },
            {
                "titre": "Irrigation et fertilisation",
                "contenu": """**L'eau — Clé du maraîchage :**

Les légumes ont besoin d'eau régulière. Une plante stressée par la sécheresse donnera peu de fruits et sera plus sensible aux maladies.

🚿 **Arrosoir :**
- Matin ET soir en saison sèche
- Arrosez à la base, jamais sur les feuilles
- Quantité : 5-10 litres/m² par arrosage

💧 **Système goutte-à-goutte artisanal :**
Percez de petits trous dans des bouteilles d'eau de 5L. Remplissez et enterrez à mi-hauteur entre les plants. L'eau s'écoule lentement pendant 2-3 jours. Économique et efficace !

**Fertilisation des légumes :**

🌱 **Au repiquage (base) :**
NPK 15-15-15 : 5g par trou de plantation

📅 **2 semaines après repiquage :**
Urée : 3g par plant dilué dans l'eau d'arrosage

🌸 **À la floraison :**
NPK + potasse : encourage la formation des fruits

📏 **Règle simple :**
- Petite poignée d'engrais = trop. Utilisez une cuillère à café.
- Un peu souvent = mieux que beaucoup rarement.

**Traitements préventifs :**
Chaque semaine, inspectez vos plants. Dès que vous voyez des insectes ou des taches, traitez immédiatement. Un traitement précoce coûte 10x moins cher qu'un traitement tardif.""",
                "ordre": 3
            },
        ]
    },
    {
        "titre": "Gestion des ravageurs et maladies",
        "description": "Identifiez et traitez les principales maladies et ravageurs des cultures camerounaises. Méthodes biologiques et chimiques.",
        "filiere": "Général", "niveau": "intermédiaire", "duree": 50, "ordre": 4,
        "modules": [
            {
                "titre": "Reconnaître les signes d'une plante malade",
                "contenu": """Vos plantes communiquent avec vous ! Apprenez à lire les signaux.

**Sur les feuilles :**

🟡 **Jaunissement :**
- Uniforme sur toute la plante → manque d'azote
- Entre les nervures → manque de magnésium ou de fer
- Feuilles du bas seulement → normal (vieillissement)

🟤 **Taches brunes :**
- Entourées d'un halo jaune → maladie fongique
- Angulaires, bien délimitées → maladie bactérienne
- Circulaires avec anneaux concentriques → Alternariose

🔴 **Taches rouges/rouille :**
- Poudre rouge/brune → rouille (champignon)
- Poudre blanche → oïdium (champignon)

🌀 **Déformations :**
- Feuilles enroulées, gaufrées → virus ou pucerons
- Feuilles en cuillère → manque d'eau ou chaleur
- Feuilles mosaïquées → virus

**Sur les tiges et fruits :**

⬛ **Noircissement de la base** → pourriture du collet, trop d'humidité
🟠 **Gommose** → bactéries ou Phytophthora
🔵 **Fruits déformés** → virus, carence ou mauvaise pollinisation

**Règle d'or :**
Dès que vous voyez quelque chose d'anormal, photographiez avec votre téléphone et utilisez le module de Diagnostic Phytosanitaire d'AgriGenius pour identifier le problème !""",
                "ordre": 1
            },
            {
                "titre": "Les principaux ravageurs et leur contrôle",
                "contenu": """**Les insectes ravageurs les plus courants :**

🐛 **Chenilles (Spodoptera, Helicoverpa)**
Cultures touchées : maïs, chou, tomate
Symptômes : trous dans les feuilles, fruits rongés
Traitement local : ramassage manuel le soir, décoction de neem
Traitement chimique : Chlorpyrifos, Lambda-cyhalothrine

🦗 **Pucerons (Aphis sp.)**
Cultures touchées : tomate, piment, haricot
Symptômes : colonies d'insectes verts/noirs sous les feuilles, feuilles enroulées
Traitement local : savon noir dilué (10g/L), eau de tabac
Traitement chimique : Imidaclopride, Dimethoate

🦟 **Mouches des fruits (Ceratitis, Bactrocera)**
Cultures touchées : mangue, goyave, tomate
Symptômes : fruits pourris de l'intérieur, larves blanches
Prévention : ramasser les fruits tombés, pièges attractifs
Traitement : Malathion (appât protéiné)

🐛 **Pyrales du maïs (Sesamia, Busseola)**
Cultures touchées : maïs
Symptômes : tiges creusées, plants qui tombent
Traitement : poudre de cendre dans le cornet foliaire

🐌 **Limaces et escargots**
Cultures touchées : légumes, jeunes plants
Actif : la nuit et par temps humide
Traitement : cendres autour des plants, appâts métaldéhyde

**Méthodes de lutte intégrée :**
1. **Préventif** : rotation des cultures, nettoyage du champ
2. **Biologique** : prédateurs naturels (coccinelles vs pucerons), plantes répulsives (basilic)
3. **Physique** : filets, pièges, barrières de cendre
4. **Chimique** : en dernier recours, respecter les doses""",
                "ordre": 2
            },
        ]
    },
    {
        "titre": "Production et conservation du manioc",
        "description": "Guide pratique pour produire du manioc de qualité, augmenter vos rendements et conserver vos tubercules longtemps.",
        "filiere": "Manioc", "niveau": "débutant", "duree": 40, "ordre": 5,
        "modules": [
            {
                "titre": "Choix des variétés et préparation",
                "contenu": """Le manioc est la culture vivrière la plus importante du Cameroun. Bien cultivé, il peut rapporter 3x plus.

**Variétés recommandées au Cameroun :**

🌿 **TME 419** — La plus populaire
- Cycle : 12-18 mois
- Rendement : 30-50 t/ha
- Résistante à la mosaïque et à la bactériose
- Disponible : IRAD, IITA Yaoundé

🌿 **TMEB2**
- Cycle : 12 mois
- Rendement : 25-40 t/ha
- Chair jaune, riche en bêta-carotène (bonne nutrition)

🌿 **Variétés locales améliorées**
- Demandez à votre délégué agricole les variétés adaptées à votre zone

**Préparation des boutures :**
1. Choisissez des tiges saines et mûres (6 mois minimum)
2. Coupez en morceaux de 25-30 cm avec 3-5 nœuds
3. Désinfectez les boutures : tremper 5 min dans eau + fongicide
4. Laissez sécher à l'ombre 2-3 jours avant plantation

**Préparation du terrain :**
- Labour ou billonnage selon la texture du sol
- Sol argileux lourd → billons hauts obligatoires
- Sol sableux léger → plantation à plat possible""",
                "ordre": 1
            },
            {
                "titre": "Entretien et récolte",
                "contenu": """**Plantation :**

🌱 **Espacement :** 1m x 1m = 10 000 plants/ha (rendement élevé)
🌱 **Orientation :** Plantez les boutures en oblique à 45° ou horizontalement selon le sol
🌱 **Profondeur :** 5-10 cm de sol au-dessus de la bouture

**Entretien :**

📅 **Mois 1 :**
- Vérifiez la levée (80% minimum)
- Remplacez les manquants
- Premier désherbage

📅 **Mois 2-3 :**
- Deuxième désherbage
- Buttage si nécessaire (ramener la terre autour des pieds)
- Application NPK si sol pauvre : 100 kg/ha

📅 **Mois 4-6 :**
- Désherbage final
- Surveillance des maladies (mosaïque, bactériose)

**Récolte :**

⏰ **Quand récolter ?**
- Variétés précoces : 8-12 mois
- Variétés tardives : 18-24 mois
- Signe de maturité : feuilles qui jaunissent, peau des tiges qui se détache facilement

**Conservation :**
⚠️ Le manioc frais ne se conserve que 3-5 jours !

Solutions :
1. **Cossettes séchées** → 6-12 mois de conservation
2. **Gari** (manioc fermenté râpé) → 3-6 mois
3. **Farine de manioc** → 6 mois
4. **Stockage en terre** → laissez les tubercules en terre jusqu'à la vente (max 3 mois après maturité)""",
                "ordre": 2
            },
        ]
    },
]

# Supprimer les anciens cours si existants
try:
    db.query(ModuleCours).delete()
    db.query(Cours).delete()
    db.commit()
    print("Anciens cours supprimés")
except:
    db.rollback()

# Insérer les nouveaux cours
for cours_data in COURS_DATA:
    modules = cours_data.pop("modules")
    cours = Cours(**cours_data)
    db.add(cours)
    db.flush()

    for i, mod_data in enumerate(modules):
        mod = ModuleCours(cours_id=cours.id, **mod_data)
        db.add(mod)

    print(f"✓ Cours créé : {cours.titre}")

db.commit()
db.close()
print(f"\n✅ {len(COURS_DATA)} cours insérés avec succès !")
