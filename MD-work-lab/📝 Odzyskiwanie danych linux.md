Jeśli przypadkowo usunąłeś jakiekolwiek dane z dysku, to możliwie szybko odmontuj ten dysk w systemie lub przemontuj go w trybie read-only, jeśli jest tylko taka możliwość (jeśli usunąłeś to z partycji systemowej, to może być problem).

```bash
umount nazwa_dysku
```

Następnie, jeśli planujesz używać aplikacji do odzyskiwania danych, wykonaj pełną, binarną kopię bezpieczeństwa dysku.

```bash
dd if=/dev/dysk_twardy of=/sciezka/do/backupu
```

**UWAGA**: kopia binarna zajmuje dokładnie tyle, ile pojemności ma dysk. Jeśli backupujesz dysk 1TB, na którym miałeś 100MB danych, to kopia zajmie 1TB. Zajętość dysku, czy ilość wolnego miejsca nie mają wpływu na wielkość backupu.

```bash
ext4magic -f/ /sciezka/do/backupu

mkdir /tmp/odzyskane

ext4magic -m -d /tmp/odzyskane /sciezka/do/backupu

#można spróbować użyć flagi -M
```

---

Kolejną aplikacją jest:

```bash
testdisk /tmp/sciezka/dobackupu
```
