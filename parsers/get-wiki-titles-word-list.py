# unique_words.py

def extract_unique_words(input_file, output_file):
    unique_words = set()

    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            # Remove whitespace/newline
            title = line.strip()
            if not title:
                continue
            
            title.replace(',', '_')

            # Split on underscores
            parts = title.split("_")

            # Add each word to the set
            for word in parts:
                if word:  # ignore empty strings
                    unique_words.add(word)

    # Save sorted list to file
    with open(output_file, "w", encoding="utf-8") as f:
        for word in sorted(unique_words):
            f.write(word + "\n")


if __name__ == "__main__":
    extract_unique_words("/Users/asafmalin/Documents/GitHub/systematic-editing/parsers/data/enwiki-20250820-all-titles-in-ns0.txt", "/Users/asafmalin/Documents/GitHub/systematic-editing/parsers/data/unique_words.txt")
    print("Done! Unique words saved to unique_words.txt")