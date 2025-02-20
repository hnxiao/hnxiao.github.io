FasdUAS 1.101.10   ��   ��    k             l      ��  ��   MG
PapersToBibDesk: To transfer citations from Papers to BibDesk and 
auto-generate a citekey.

Place this in ~/Library/Scripts/Applications/Papers
Create this folder if necessary.

Select the references you wish to transfer in Papers first.

Your destination BibDesk file must be opened in BibDesk before starting.

Then run the script.

Make the pause longer if you are getting errors.

If you get an applescript error, make sure to delete the ptb.bib file from 
your home folder before re-running!

If you don't want the cite-key autogenerated, comment out the line:
tell application "System Events" to keystroke "k" using {command down}
near the end as noted in the comments.

With some code inspiration from the ever useful:
http://bibdesk.sourceforge.net/wiki/index.php/BibDesk_Applescripts

Sean Anderson, 2008
sean "at" dal "dot" ca
     � 	 	� 
 P a p e r s T o B i b D e s k :   T o   t r a n s f e r   c i t a t i o n s   f r o m   P a p e r s   t o   B i b D e s k   a n d   
 a u t o - g e n e r a t e   a   c i t e k e y . 
 
 P l a c e   t h i s   i n   ~ / L i b r a r y / S c r i p t s / A p p l i c a t i o n s / P a p e r s 
 C r e a t e   t h i s   f o l d e r   i f   n e c e s s a r y . 
 
 S e l e c t   t h e   r e f e r e n c e s   y o u   w i s h   t o   t r a n s f e r   i n   P a p e r s   f i r s t . 
 
 Y o u r   d e s t i n a t i o n   B i b D e s k   f i l e   m u s t   b e   o p e n e d   i n   B i b D e s k   b e f o r e   s t a r t i n g . 
 
 T h e n   r u n   t h e   s c r i p t . 
 
 M a k e   t h e   p a u s e   l o n g e r   i f   y o u   a r e   g e t t i n g   e r r o r s . 
 
 I f   y o u   g e t   a n   a p p l e s c r i p t   e r r o r ,   m a k e   s u r e   t o   d e l e t e   t h e   p t b . b i b   f i l e   f r o m   
 y o u r   h o m e   f o l d e r   b e f o r e   r e - r u n n i n g ! 
 
 I f   y o u   d o n ' t   w a n t   t h e   c i t e - k e y   a u t o g e n e r a t e d ,   c o m m e n t   o u t   t h e   l i n e : 
 t e l l   a p p l i c a t i o n   " S y s t e m   E v e n t s "   t o   k e y s t r o k e   " k "   u s i n g   { c o m m a n d   d o w n } 
 n e a r   t h e   e n d   a s   n o t e d   i n   t h e   c o m m e n t s . 
 
 W i t h   s o m e   c o d e   i n s p i r a t i o n   f r o m   t h e   e v e r   u s e f u l : 
 h t t p : / / b i b d e s k . s o u r c e f o r g e . n e t / w i k i / i n d e x . p h p / B i b D e s k _ A p p l e s c r i p t s 
 
 S e a n   A n d e r s o n ,   2 0 0 8 
 s e a n   " a t "   d a l   " d o t "   c a 
   
  
 l     ��������  ��  ��        l         r         m        ?�ffffff  o      ���� 	0 pause      adjust as needed     �   "   a d j u s t   a s   n e e d e d      l     ��  ��    / ) make as short as possible without errors     �   R   m a k e   a s   s h o r t   a s   p o s s i b l e   w i t h o u t   e r r o r s      l     ��������  ��  ��        l    ����  O         I   ������
�� .miscactvnull��� ��� null��  ��     m     ! !�                                                                                  MTPa   alis    L  Macintosh HD               �GΠH+     �
Papers.app                                                      �x��ܕc        ����  	                Applications    �H�      ��ͣ       �  $Macintosh HD:Applications:Papers.app   
 P a p e r s . a p p    M a c i n t o s h   H D  Applications/Papers.app   / ��  ��  ��     " # " l     ��������  ��  ��   #  $ % $ l   t &���� & O    t ' ( ' k    s ) )  * + * O    K , - , O    J . / . O   ! I 0 1 0 O   ( H 2 3 2 O   / G 4 5 4 O   6 F 6 7 6 I  = E�� 8��
�� .prcsclicuiel    ��� uiel 8 4   = A�� 9
�� 
menI 9 m   ? @ : : � ; ;  B i b T e X   L i b r a r y��   7 4   6 :�� <
�� 
menE < m   8 9 = = � > >  E x p o r t . . . 5 4   / 3�� ?
�� 
menI ? m   1 2 @ @ � A A  E x p o r t . . . 3 4   ( ,�� B
�� 
menE B m   * + C C � D D  F i l e 1 4   ! %�� E
�� 
mbri E m   # $ F F � G G  F i l e / 4    �� H
�� 
mbar H m    ����  - 4    �� I
�� 
prcs I m     J J � K K  P a p e r s +  L M L I  L S�� N��
�� .prcskprsnull���    utxt N m   L O O O � P P  ~ / p t b . b i b��   M  Q R Q I  T [�� S��
�� .prcskprsnull���    utxt S o   T W��
�� 
ret ��   R  T U T I  \ a�� V��
�� .sysodelanull��� ��� nmbr V o   \ ]���� 	0 pause  ��   U  W X W I  b i�� Y��
�� .prcskprsnull���    utxt Y o   b e��
�� 
ret ��   X  Z�� Z l  j s [ \ ] [ I  j s�� ^��
�� .sysodelanull��� ��� nmbr ^ ]   j o _ ` _ o   j k���� 	0 pause   ` m   k n a a @      ��   \   again: adjust as needed    ] � b b 0   a g a i n :   a d j u s t   a s   n e e d e d��   ( m     c c�                                                                                  sevs   alis    �  Macintosh HD               �GΠH+     �System Events.app                                                ���        ����  	                CoreServices    �H�      ��C       �   Q   P  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��  ��  ��   %  d e d l     ��������  ��  ��   e  f g f l     �� h i��   h    make sure BibDesk is open    i � j j 4   m a k e   s u r e   B i b D e s k   i s   o p e n g  k l k l  u � m���� m Z   u � n o���� n >  u ~ p q p n   u | r s r 1   x |��
�� 
prun s m   u x t t�                                                                                  BDSK   alis    T  Macintosh HD               �GΠH+   �TBibDesk.app                                                     ��!Įd�        ����  	                TeX     �H�      Į�&     �T   �  )Macintosh HD:Applications:TeX:BibDesk.app     B i b D e s k . a p p    M a c i n t o s h   H D  Applications/TeX/BibDesk.app  / ��   q m   | }��
�� boovtrue o k   � � u u  v w v l  � � x y z x I  � ��� {��
�� .sysoexecTEXT���     TEXT { m   � � | | � } }  r m   ~ / p t b . b i b��   y  clean up    z � ~ ~  c l e a n   u p w   �  I  � ��� � �
�� .sysodlogaskr        TEXT � m   � � � � � � � Z P l e a s e   o p e n   B i b D e s k   a n d   a   b i b l i o g r a p h y   f i r s t . � �� � �
�� 
btns � J   � � � �  ��� � m   � � � � � � �  O K��   � �� ���
�� 
dflt � m   � ����� ��   �  ��� � L   � �����  ��  ��  ��  ��  ��   l  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � ' ! make sure a bibliography is open    � � � � B   m a k e   s u r e   a   b i b l i o g r a p h y   i s   o p e n �  � � � l  � � ����� � Q   � � � � � � O   � � � � � r   � � � � � e   � � � � 4  � ��� �
�� 
docu � m   � �����  � o      ���� 0 thedoc theDoc � m   � � � ��                                                                                  BDSK   alis    T  Macintosh HD               �GΠH+   �TBibDesk.app                                                     ��!Įd�        ����  	                TeX     �H�      Į�&     �T   �  )Macintosh HD:Applications:TeX:BibDesk.app     B i b D e s k . a p p    M a c i n t o s h   H D  Applications/TeX/BibDesk.app  / ��   � R      ������
�� .ascrerr ****      � ****��  ��   � k   � � � �  � � � l  � � � � � � I  � ��� ���
�� .sysoexecTEXT���     TEXT � m   � � � � � � �  r m   ~ / p t b . b i b��   �  clean up    � � � �  c l e a n   u p �  � � � I  � ��� � �
�� .sysodlogaskr        TEXT � m   � � � � � � � � N o   B i b D e s k   b i b l i o g r a p h i e s   w e r e   f o u n d   o p e n .   P l e a s e   o p e n   t h e   b i b l i o g r a p h y   y o u   w i s h   t o   i m p o r t   i n t o   f i r s t . � �� � �
�� 
btns � J   � � � �  ��� � m   � � � � � � �  O K��   � �� ���
�� 
dflt � m   � ����� ��   �  ��� � L   � �����  ��  ��  ��   �  � � � l     ��������  ��  ��   �  � � � l  �� ����� � O   �� � � � k   �� � �  � � � I  � �������
�� .miscactvnull��� ��� null��  ��   �  � � � r   � � � � c   � � � � � l  � � ����� � b   � � � � � l  � � ����� � I  � ��� ���
�� .earsffdralis        afdr � m   � ���
�� afdrcusr��  ��  ��   � m   � � � � � � �  p t b . b i b��  ��   � m   � ���
�� 
TEXT � o      ���� 0 
targetpath 
targetPath �  � � � I �� ���
�� .aevtodocnull  �    alis � o  ���� 0 
targetpath 
targetPath��   �  � � � r   � � � e   � � 4 �� �
�� 
docu � m  ����  � o      ���� 0 thedoc theDoc �  � � � O  Q � � � k  P � �  � � � r  ' � � � 2 #��
�� 
bibi � o      ���� 0 somepubs somePubs �  � � � r  (1 � � � o  (+���� 0 somepubs somePubs � l      ����� � 1  +0��
�� 
sele��  ��   �  � � � r  2; � � � l 27 ����� � 1  27��
�� 
sele��  ��   � o      ���� 0 theselection theSelection �  ��� � O <P � � � I @O�� � �
�� .prcskprsnull���    utxt � m  @C � � � � �  c � �� ���
�� 
faal � J  FK � �  ��� � m  FI��
�� eMdsKcmd��  ��   � m  <= � ��                                                                                  sevs   alis    �  Macintosh HD               �GΠH+     �System Events.app                                                ���        ����  	                CoreServices    �H�      ��C       �   Q   P  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��  ��   � o  ���� 0 thedoc theDoc �  � � � I R\�� ��
�� .coreclosnull���    obj  � 4 RX�~ �
�~ 
docu � m  VW�}�} �   �  � � � l ]]�|�{�z�|  �{  �z   �  � � � r  ]h �  � e  ]d 4 ]d�y
�y 
docu m  ab�x�x   o      �w�w 0 thedoc theDoc � �v O  i� k  o�  r  ox	
	 2 ot�u
�u 
bibi
 o      �t�t 0 somepubs somePubs  r  y� o  y|�s�s 0 somepubs somePubs l     �r�q 1  |��p
�p 
sele�r  �q    O �� I ���o
�o .prcskprsnull���    utxt m  �� �  v �n�m
�n 
faal J  �� �l m  ���k
�k eMdsKcmd�l  �m   m  ���                                                                                  sevs   alis    �  Macintosh HD               �GΠH+     �System Events.app                                                ���        ����  	                CoreServices    �H�      ��C       �   Q   P  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��    l ���j�j   1 + auto-set the cite-key: (delete if desired)    �   V   a u t o - s e t   t h e   c i t e - k e y :   ( d e l e t e   i f   d e s i r e d ) !�i! O ��"#" I ���h$%
�h .prcskprsnull���    utxt$ m  ��&& �''  k% �g(�f
�g 
faal( J  ��)) *�e* m  ���d
�d eMdsKcmd�e  �f  # m  ��++�                                                                                  sevs   alis    �  Macintosh HD               �GΠH+     �System Events.app                                                ���        ����  	                CoreServices    �H�      ��C       �   Q   P  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��  �i   o  il�c�c 0 thedoc theDoc�v   � m   � �,,�                                                                                  BDSK   alis    T  Macintosh HD               �GΠH+   �TBibDesk.app                                                     ��!Įd�        ����  	                TeX     �H�      Į�&     �T   �  )Macintosh HD:Applications:TeX:BibDesk.app     B i b D e s k . a p p    M a c i n t o s h   H D  Applications/TeX/BibDesk.app  / ��  ��  ��   � -.- l     �b�a�`�b  �a  �`  . /�_/ l ��0120 I ���^3�]
�^ .sysoexecTEXT���     TEXT3 m  ��44 �55  r m   ~ / p t b . b i b�]  1  clean up   2 �66  c l e a n   u p�_       �\78�\  7 �[
�[ .aevtoappnull  �   � ****8 �Z9�Y�X:;�W
�Z .aevtoappnull  �   � ****9 k    �<<  ==  >>  $??  k@@  �AA  �BB /�V�V  �Y  �X  :  ; 8 �U !�T c�S J�R�Q F�P C�O @ = :�N O�M�L�K a t�J |�I ��H ��G�F�E�D�C�B�A � � ��@�? ��>�=�<�;�:�9�8 ��7�6�5&4�U 	0 pause  
�T .miscactvnull��� ��� null
�S 
prcs
�R 
mbar
�Q 
mbri
�P 
menE
�O 
menI
�N .prcsclicuiel    ��� uiel
�M .prcskprsnull���    utxt
�L 
ret 
�K .sysodelanull��� ��� nmbr
�J 
prun
�I .sysoexecTEXT���     TEXT
�H 
btns
�G 
dflt�F 
�E .sysodlogaskr        TEXT
�D 
docu�C 0 thedoc theDoc�B  �A  
�@ afdrcusr
�? .earsffdralis        afdr
�> 
TEXT�= 0 
targetpath 
targetPath
�< .aevtodocnull  �    alis
�; 
bibi�: 0 somepubs somePubs
�9 
sele�8 0 theselection theSelection
�7 
faal
�6 eMdsKcmd
�5 .coreclosnull���    obj �W��E�O� *j UO� b*��/ 2*�k/ **��/ "*��/ *��/ *��/ 
*��/j UUUUUUOa j O_ j O�j O_ j O�a  j UOa a ,e %a j Oa a a kva ka  OhY hO a  *a  k/EE` !UW 'X " #a $j Oa %a a &kva ka  OhOa  �*j Oa 'j (a )%a *&E` +O_ +j ,O*a  k/EE` !O_ ! 4*a --E` .O_ .*a /,FO*a /,E` 0O� a 1a 2a 3kvl UUO*a  k/j 4O*a  k/EE` !O_ ! ?*a --E` .O_ .*a /,FO� a 5a 2a 3kvl UO� a 6a 2a 3kvl UUUOa 7j  ascr  ��ޭ