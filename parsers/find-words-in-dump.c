#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define BEFORE 10

int found(const char *context,const char *text) {
   int l = strlen(text);
   return strncmp(text, context+BEFORE-l, l) == 0;
}

int main()
{
   int milon_count=0;
   int i,j,k=0,lll=0,existing=0,textflag=0,fileflag=1,imageflag=1,templateflag=1,italicflag=1,divflag=1,
   codeflag=1,sourceflag=1,doublenewline=1,poemflag=1,
   galleryflag=1,linkflag=1,quoteflag=1,doublequoteflag=1,doublequoteflag2=1,columnsflag=1,
   spaceflag=0,noteflag=1,noteflag2=1,noteflag3=1,namecount=0,nameflag=0,namespaceflag=0, wiktionflag=1;
   int saweng=0;
   char typo[80];
   char oldtypo[80];
   char pagename[100];
   char *correction;
   char *method;
   char *location;
   char lastchar=0,lastchar2;
   char (*milon)[61];
   char context[BEFORE];
   milon = calloc (22000000, sizeof(char[61]));

   // to access character i of word w
   FILE *fp1 = fopen("enwiki-20220701-pages-articles.xml", "r");
   FILE *fp2 = fopen("typos.txt", "r");
   FILE *fp3 = fopen("file3.txt", "w");

   if (fp1 == NULL || fp2 == NULL || fp3 == NULL )
   {
   puts("Could not open files");
   exit(0);
   }

   j=0;
   k=0;
   char c;
   while ((c = fgetc(fp2)) != EOF) //load main milon
   {
      milon[j][k]=c;
      if(j==22000000)break;
      if(k>59&&c!='\n')continue;
      if(c==',')milon[j][k]=0;
      if(c=='\n'){milon[j][k]=0;milon_count++;j++;k=0;} //end of word - move to next word
      if (c!='\n')k++;
   }

   j=0;
   c=0;
   while (c!=EOF){//word loop
      k=0;typo[0]=0;
   while ((c = fgetc(fp1))!=EOF){//letter loop

      //save article name: if <title>
      if(found(context,"<title>")){
         nameflag=1;
      }

      if(nameflag==1){pagename[namecount]=c;namecount++;}
      if(nameflag==1&&context[BEFORE-1]=='<'&&c=='/'){pagename[namecount-2]=0;namecount=0;nameflag=0;}

      //close tags in new article
      if(nameflag==1)
         {divflag=1;codeflag=1;galleryflag=1;templateflag=1;doublenewline=1;
                  columnsflag=1;sourceflag=1;noteflag=1;noteflag2=1;noteflag3=1;}
      //only search within articles text
      if(found(context,"<text")){textflag=1;}
      if(found(context,"</text")){typo[0]=0;textflag=0;}
      //only search namespace 0
      if(found(context,"<ns>")){
         if(c=='0'){namespaceflag=1;}
         else{typo[0]=0;namespaceflag=0;}
      }
      //skip files
      if(found(context,"File") || found(context,"file")){typo[0]=0;fileflag=0;}
      if(fileflag==0&&c=='\n'){fileflag=1;}
      if(found(context,"Image") || found(context,"image")){typo[0]=0;imageflag=0;}
      if(imageflag==0&&c=='\n'){imageflag=1;}
      //skip templates
      if(found(context,"{{")){
         typo[0]=0;
         doublenewline=0;
         templateflag++;
      }
      if(context[BEFORE-1]=='}'&&c!='}'){
         templateflag--;
      }
      if(found(context,"\n\n")){doublenewline=1;}
      //skip links
      if(found(context,"[h")){typo[0]=0;linkflag=0;}
      if(linkflag==0&&c==']'){linkflag=1;}
      if(linkflag==0&&c=='\n'){linkflag=1;}
      //skip blockquotes
      if(found(context,";bloc")){typo[0]=0;quoteflag=0;}
      if(found(context,";/bloc")){typo[0]=0;quoteflag=1;}
      if(nameflag==1){quoteflag=1;}
      //skip doublequotes
      if(context[BEFORE-1]=='"'){typo[0]=0;doublequoteflag=0;}
      if(doublequoteflag==0&&c=='"'){doublequoteflag=1;}
      //skip doublequotes2
      if(found(context,"&quot;")){typo[0]=0;doublequoteflag2=0;}
      if(found(context,"&quot")){doublequoteflag2=1;}
      if(doublequoteflag2==0&&c=='\n'){doublequoteflag2=1;}
      //skip italics
      if(found(context,"\'\'")){typo[0]=0;italicflag=0;}
      if(context[BEFORE-1]=='\''&&c=='\''){italicflag=1;}
      if(italicflag==0&&c=='\n'){italicflag=1;}
      //skip columns
      if(found(context,"{|")){typo[0]=0;columnsflag=0;}
      if(found(context,"|}")){columnsflag=1;}
      //skip notes
      if(found(context,";ref&gt;") || found(context,";ref &gt;")){typo[0]=0;noteflag=0;}
      if(found(context,";/ref&")){noteflag=1;}
      //skip notes
      if(found(context,";!--")){typo[0]=0;noteflag2=0;}
      if(found(context,"&gt;")){noteflag2=1;}
      //skip notes
      if(found(context,";ref name")){typo[0]=0;noteflag3=0;}
      if(found(context,"--&gt;")){noteflag3=1;}
      //skip div
      if(found(context,";div")){typo[0]=0;divflag=0;}
      if(found(context,";/div&")){divflag=1;}
      //skip <code>
      if(found(context,";code")){typo[0]=0;codeflag=0;}
      if(found(context,";/code")){codeflag=1;}
      //skip <poem>
      if(found(context,";poem")){typo[0]=0;poemflag=0;}
      if(found(context,";/poem")){poemflag=1;}
      //skip <gallery>
      if(found(context,";gallery")){typo[0]=0;galleryflag=0;}
      if(found(context,";/gallery")){galleryflag=1;}     
      //skip <source>
      if(found(context,";source")){typo[0]=0;sourceflag=0;}
      if(found(context,";/source")){sourceflag=1;}

      //save context
      for(i=0;i<BEFORE;i++){context[i]=context[i+1];}
      context[BEFORE-1]=c;

      if(k==79){spaceflag=0;break;}

      if(namespaceflag==1&&textflag==1&&spaceflag==1&&fileflag==1&&imageflag==1&&
         galleryflag==1&&italicflag==1&&columnsflag==1&&sourceflag==1&&doublenewline==1&&
         templateflag==1&&noteflag==1&&noteflag2==1&&noteflag3==1&&divflag==1&&codeflag==1&&
         linkflag==1&&quoteflag==1&&doublequoteflag==1&&doublequoteflag2==1&&wiktionflag==1)
         {typo[k]=c;k++;}

      //ignore short links
      if(typo[k-2]=='.'&&typo[k-1]!=' '&&typo[k-1]!='\n')
         {typo[0]='\0';spaceflag=0;break;}

      //chars to separate words and initialize space
      if (c=='\n'||c==' '||c=='\t')
         {typo[k-1]='\0';spaceflag=1;break;}

      //chars to separate words and check
      if (c=='-'||c=='}'||c=='['||c==','||c=='.'||c=='"'||c==';'||
         c=='^'||c=='~'||c=='#'||c=='='||c=='&'||c==')'||
         c=='|'||c=='<'||c=='>'||c=='?'||c=='^'||c=='_')
      {typo[k-1]='\0';break;}

      //chars to delete words and wait for space
      if(k>0&&(c==':'||c=='%'||c=='('||c=='/'||c=='\\'||c=='@'||c=='$'||c=='!'||c=='{'))
      {typo[0]='\0';spaceflag=0;break;}

   }
      if(strlen(typo)<5)continue;
      int min=0;
      int max=milon_count;
      while(max>=min){
         j=min+(max-min)/2;
         if (strcmp(typo,milon[j]) == 0) {
            correction=milon[j]+strlen(milon[j])+1;
            method=correction+strlen(correction)+1;
            location=method+strlen(method)+1;
            fprintf(fp3, "\nINSERT INTO `suspects` (`project`,`title`,`suspect`,`correction`,`type`,`location`,`status`,`fixer`) VALUES ('en.wikipedia','%s','%s','%s','%s','%s',0,'');", pagename, typo, correction, method, location);
            break;
         }
         if (strcmp(typo,milon[j])>0){min=j+1;}
         if (strcmp(typo,milon[j])<0){max=j-1;}
      }
   }

   fprintf(fp3,"\nFinally!");

   fclose(fp1);
   fclose(fp2);
   fclose(fp3);
   free(milon);
   return 0;
}