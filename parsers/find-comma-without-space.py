# -*- coding: utf-8 -*-
import json
import re
import time;

# with open('/Users/mbpmbp/Documents/GitHub/systematic-editing/parsers/data/en-variations.txt') as f:
#    suspects = {}
#    for line in f:
#       (key, val) = line.split()
#       suspects[key] = val

# with open('/Users/mbpmbp/Documents/GitHub/systematic-editing/parsers/data/enwiki-2022-08-29.txt') as f:
#    existingWords = {}
#    for line in f:
#       (key, val) = line.split()
#       existingWords[key] = int(val)

def decodeLine(line):
    line = line.replace('&quot;','"')
    line = line.replace('&lt;','<')
    line = line.replace('&gt;','>')
    line = line.replace('&amp;','&')
    line = line.replace('&nbsp;',' ')
    line = line.replace('&mdash;','—')
    return line

def escapeSql(text):
    text = text.replace("\\","\\\\")
    text = text.replace("'","\\'")
    return text

def closingTagClosingFlag(word, flags):
    if '</block' in word:
        flags.quote3flag = 0
    if ']' in word:
        flags.externalflag = 0
    if '-->' in word: 
        flags.commentflag = 0
    if '/ref' in word:
        flags.refflag = 0
    if '/div' in word:
        flags.divflag = 0       
    if '/timeline' in word:
        flags.timeline = 0
    if '/code' in word:
        flags.codeflag = 0 
    if '/math' in word:
        flags.math = 0
    if '\'\'' in word and flags.quote2flag:
        flags.quote2flag = 0
    if '/poem' in word:
        flags.poemflag = 0
    if '/gallery' in word:
        flags.galleryflag = 0
    if '/Gallery' in word:
        flags.Galleryflag = 0  
    if '/source' in word:
        flags.sourceflag = 0
    if (word.count('"') % 2) and flags.quoteflag:
        flags.quoteflag = 0


def countUnknownWords(history):
    historyStr = ' '.join(history)
    words = re.split(r"([\-{}\[,.\";\^~#\=&\)\|<>\?]*\s+[\-{},.\";\^~#\=&\)\|>\?]*)", historyStr)
    count = 0
    nonExisting = ''
    for index, currentword in enumerate(words):
        currentword = currentword.strip("'")
        hasNonLetter = False
        hasCapital = False
        hasNonAscii = False
        #check if currentword contains capital letter
        for letter in currentword:
            if letter.isupper():
                hasCapital = True
            if not letter.isalpha() and letter != "'":
                hasNonLetter = True
            if not letter.isascii():
                hasNonAscii = True
        if currentword and (hasNonAscii or (not hasNonLetter and not hasCapital and currentword not in existingWords)):
            nonExisting = nonExisting + ',' + currentword
            count += 1
    # if count > 1:
    #     print(nonExisting)
    return count

class isScanFlags:
    def __init__(self):
        self.mainflag = 1
        self.textflag = 1
    def newArticleReset(self):
        self.templateflag = 0
        self.externalflag = 0
        self.refflag = 0
        self.timeline = 0
        self.math = 0
        self.fileflag = 0
        self.quoteflag = 0
        self.quote2flag = 0
        self.quote3flag = 0
        self.commentflag = 0
        self.divflag = 0
        self.codeflag = 0
        self.poemflag = 0
        self.galleryflag = 0
        self.Galleryflag = 0
        self.sourceflag = 0
    
mainstr = '<ns>0</ns>'
endpage = '</page>'
#typos = []
#checkedWords = {}
title = ''
history = [''] * 9
f = open('/Users/mbpmbp/Documents/GitHub/systematic-editing/parsers/data/'+str(time.time())+'results.txt', 'w')
fspaces = open('/Users/mbpmbp/Documents/GitHub/systematic-editing/parsers/data/space'+str(time.time())+'results.txt', 'w')
from bz2 import BZ2File
with BZ2File('/Users/mbpmbp/Documents/GitHub/systematic-editing/parsers/data/hewiki-20230801-pages-articles.xml.bz2','rb') as file:
#option to run on local env
#with open('/Users/mbpmbp/Documents/GitHub/systematic-editing/parsers/data/enwiki-20230720-pages-articles18.xml-p26716198p27121850') as file:
    flags = isScanFlags()
    for line in file:
        line = line.decode()
        line = decodeLine(line)
        for index, historyline in enumerate(history[::]):
            if not index:
                history[0] = line
                history[index + 1] = historyline
            elif index != len(history) - 1:
                history[index + 1] = historyline
        if '<title>' in line:
            title = line
            flags.newArticleReset()
        if '<text' in line:
            flags.textflag = 0
        if flags.textflag:
            continue
        if mainstr in line:
            flags.mainflag = 0
            flags.textflag = 1
        if endpage in line:
            flags.mainflag = 1
        if flags.mainflag:
            continue
        if line[0][0] == ':':
            continue
        previous = next_ = ''
        line = line.rstrip('\n')+' '

        objects = re.split(r"([\-{}\[.\";\^~#\=&\)\|<>\?]*\s+[\-{}.\";\^~#\=&\)\|>\?]*)", line)
        l = len(objects)-2
        for index, word in enumerate(objects):
            if word == ' ':
                continue
            if '}}' in word and flags.templateflag > 0:
                flags.templateflag -= 1
            if '{{' in word:
                flags.templateflag += 1
            if '[קובץ' in word:
                flags.fileflag = 1
            if '[תמונה' in word:
                flags.fileflag = 1
            if '[Image' in word:
                flags.fileflag = 1
            if '[image' in word:
                flags.fileflag = 1
            if '[h' in word:
                flags.externalflag = 1
            if '<!--' in word:
                flags.commentflag = 1
            if '<ref' in word:
                flags.refflag = 1
            if '<timeline' in word:
                flags.timeline = 1
            if '<math' in word:
                flags.math = 1
            if '<div' in word:
                flags.divflag = 1
            if '<code' in word:
                flags.codeflag = 1   
            if '<poem' in word:
                flags.poemflag = 1
            if '<gallery' in word:
                flags.galleryflag = 1
            if '<Gallery' in word:
                flags.Galleryflag = 1  
            if '<source' in word:
                flags.sourceflag = 1    
            if (word.count('"') % 2) and not flags.quoteflag:
                flags.quoteflag = 1
                continue
            if '\'\'' in word and not flags.quote2flag:
                flags.quote2flag = 1
                continue
            if '<block' in word:
                flags.quote3flag = 1

            if flags.templateflag or flags.sourceflag or flags.Galleryflag or flags.galleryflag or flags.poemflag or flags.codeflag or flags.divflag or flags.quoteflag or flags.quote2flag or flags.quote3flag or flags.commentflag or flags.externalflag or flags.fileflag or flags.refflag or flags.timeline or flags.math:
                #only remove flags after checking flags, to exclude case the flag closure in the current word
                closingTagClosingFlag(word, flags)
                continue

            if ',' not in word:
                continue
            pattern = ',(?=[^ 0-9])'
            replace = ', '
            variant = re.sub(pattern, replace, word)
            if variant == word:
                continue
            #if comma at the beginning of the word and the object before it is space, remove the space before by adding it to the word
            if word[0] == ',' and index and objects[index-1] == ' ':
                word = ' ' + word
            #if not word.isalpha():
            #    continue
            #if len(word) < 3:
            #    continue
            #if not word.islower():
            #    continue
            #if word not in suspects:
            #    continue
            #if countUnknownWords(history) > 1:
            #    continue
            #if the word without last s in words
            #if word[0:len(word)-1:] and word[len(word)-1]=='s' and word[len(word)-2]!='s':
            #    continue
            #if word in engrem:
            #    continue
            #if word in checkedWords:
            #    continue
            #checkedWords[word] = True
            #if word not in dbvariations:
            #    continue
            #if word in typos:
            #    break
            
            #row = suspects[word].split(",")
            #variant = row[0]
            #variationType = row[1]
            #spot = int(row[2])
            
            #typos.append(word)
            before = ''
            after = ''
            trimmedTitle = title.replace('    <title>','').replace('</title>\n','')
            trimmedTitle = escapeSql(trimmedTitle)
            word = escapeSql(word)
            if len(word) > 90:
                continue
            variant = escapeSql(variant)
            f.write(word+" INSERT INTO `suspects` (`project`,`title`,`suspect`,`correction`,`type`,`location`,`status`,`fixer`) VALUES ('he.wikipedia','"+trimmedTitle+"','"+word+"','"+variant+"','missingSpaceAfterComma','0',0,'');\n")
            #f.flush()
            break
f.close()
