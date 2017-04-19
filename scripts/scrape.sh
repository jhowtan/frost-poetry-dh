#!/usr/local/bin/bash
for i in {1..15}
do
    echo "Downloading poem $i"
    curl http://www.bartleby.com/155/$i.html > $i.html
done

