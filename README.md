# Stellaris_IA_Reactive
Ce projet implementé par p5.js est une simulaion de jeux qui conciste à piloter un vaisseau spacial à l'aide d'un ensemble de comportements declenchés soit par le mouvement de la souris ou par l'appuie sur des touches de clavier.

## Vaisseaux spaciaux
Le vaisseau spacial à pour premier comportement de suivre le positionement dans l'espace 2D de la souris à l'aide du comportement "seek" en cas d'appuie sur la touche "F" le comportement "wander" est activé pour le vaiseau spacial et choisis sa propre trajectoire aleatoire. Le vaisseau est confronté à des obstacles qu'il evite de faire une collison avec à l'aide du comportement "avoid" et lance des missiles sur les ovnis qui les atteignent à l'aide du comportement "persue".

## Ovnis
les ovnis ne se coincident pas à l'aide du comportement "seperate".

## Missiles
Les missiles qui héritent la classe vehicule évitent les obstacles et poursuivent le vehicule le plus proche


## Le lien vers le demo

https://sabde03.github.io/Stellaris_IA_Reactive/




