#list of words by frequency thanks to https://github.com/IlyaSemenov/wikipedia-word-frequency/
#the file is too big for browsers, got the file by running wget https://raw.githubusercontent.com/IlyaSemenov/wikipedia-word-frequency/master/results/frwiki-2022-08-29.txt
with open('/Users/asafmalin/Documents/GitHub/systematic-editing/parsers/data/enwiki-2023-04-13.txt') as f:
   words = {}
   for line in f:
      (key, val) = line.split(' ')
      words[key] = int(val)

def getVariations(word):
    omit = {}
    double = {}
    swap = {}
    swap2 = {}
    replace = {}
    #duplicating a letter
    for x in range(len(word)):
        double[(word[0 : x : ] + word[x] + word[x : :])] = x
    #omiting a letter
    for x in range(len(word)):
        omit[(word[0 : x : ] + word[x + 1 : :])] = x
    #swapping a letter
    for x in range(len(word)-1):
        swap[(word[0 : x : ] + word[x + 1] + word[x] + word[x + 2 : :])] = x
    #swapping a 2nd letter
    for x in range(len(word)-2):
        swap2[(word[0 : x : ] + word[x + 2]  + word[x + 1] + word[x] + word[x + 3 : :])] = x
    #replacing by another letter
    #en 'abcdefghijklmnopqrstuvwxyz'
    #fr 'abcdefghijklmnopqrstuvwxyzéàèùçëïüâêîôû'
    for letter in 'abcdefghijklmnopqrstuvwxyz':
        for x in range(len(word)):
            if word[x] in 'abcdefghijklmnopqrstuvwxyz':
                replace[(word[0 : x : ] + letter + word[x + 1 : :])] = x
    variations = {
        'double': double,
        'omit': omit,
        'swap': swap,
        'swap2': swap2,
        'replace': replace
    }
    return variations

f = open('/Users/asafmalin/Documents/GitHub/systematic-editing/parsers/data/en-variations.txt', 'w')
variants = {}

for word in words:
   if words[word]<150:#if word has value less appearances on wikipedia, don't variate it
      continue
   if not word.isalpha():
       continue
   wordVariations = getVariations(word)
   for variationType in wordVariations:
      for variant in wordVariations[variationType]:
         if len(variant)>2 and variant not in words and variant not in variants:
            variants[variant] = True
            spot = wordVariations[variationType][variant]
            combined = variant+' '+word+','+variationType+','+str(spot)+'\n'
            f.write(combined)
               
