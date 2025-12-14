# Stellaris_IA_Reactive
Ce projet implementé par p5.js est une simulaion de jeux qui conciste à piloter un vaisseaux spaciale à l'aide d'un ensemble de comportement declenchés soit par le mouvement de la sourie ou par l'appuie sur des touche de clavier.

## Vaisseaux spacial
Le vaisseau spaciale à pour premier comportement de suivre le positionement dans l'espace 2D de la sourie à l'aide du comportement "seek" en cas d'appuie sur la touche "F" le comportement "wander" est activé pour le vaiseaux spaciale et choisis sa propre trajectoire aleatoire. Le vaisseaux est confronté à des obstacles qu'il evite de faire une collison avec à l'aide du comportement "avoid" et lance des missiles sur les ovnis qui les atteignent à l'aide du comportement "persue".

## Ovnis
les ovnis ne se coincident pas à l'aide du comportement "seperate".



