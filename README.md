# Kalkulator IPS Pintar

Aplikasi sederhana untuk menghitung Indeks Prestasi Semester (IPS) dengan fitur pemindaian (scan) transcript menggunakan AI.

## Fitur
- Hitung IPS otomatis berdasarkan daftar mata kuliah.
- Tambah / hapus / edit mata kuliah secara manual.
- Scan foto KHS/transcript untuk ekstraksi data mata kuliah otomatis menggunakan AI.
- Simpan hasil sebagai PDF (print).

## Cara kerja utama
- UI dan logika utama: [`App`](App.tsx) ([App.tsx](App.tsx))
- Ekstraksi gambar → JSON: fungsi [`scanTranscriptImage`](geminiService.ts) ([geminiService.ts](geminiService.ts))
- Skala nilai & helper: [`getPointsForGrade`](constants.ts) dan [`GRADE_SCALE`](constants.ts) ([constants.ts](constants.ts))
- Tipe data mata kuliah: [`Course`](types.ts) ([types.ts](types.ts))

## Formula IPS
IPS dihitung dengan rumus:
- <img width="195" height="47" alt="equation" src="https://github.com/user-attachments/assets/30aa1ebb-55ec-48fe-84e2-64e2ae7e2626" />
- 
![latex-equation](https://github.com/user-attachments/assets/d591e1a7-72d1-48cd-818a-138792360938)<svg style="vertical-align: -2.172ex; color: rgb(238, 238, 238);" xmlns="http://www.w3.org/2000/svg" width="298.9479217529297" height="106.76041793823242" role="img" focusable="false" viewBox="0 0 12133.133288313604 4396.840942862331" xmlns:xlink="http://www.w3.org/1999/xlink" color="#eeeeee" fill="currentColor" stroke="currentColor"><g transform="translate(946.0666441568021, 2448.4204714311654)"><defs><path id="MJX-6-NCM-N-49" d="M180 3C257 3 308 2 333 0L333 39L304 39C268 39 246 41 239 46C232 51 228 63 228 81L228 602C228 620 232 631 239 636C246 641 268 644 304 644L333 644L333 683C308 681 257 680 181 680C104 680 53 681 28 683L28 644L57 644C93 644 115 641 122 636C129 631 133 620 133 602L133 81C133 63 129 51 122 46C115 41 93 39 57 39L28 39L28 0C53 2 104 3 180 3Z"/><path id="MJX-6-NCM-N-50" d="M395 312C452 312 503 328 548 360C599 396 624 441 624 495C624 552 598 599 546 635C500 667 447 683 387 683L35 683L35 644L63 644C98 644 119 641 126 636C133 631 137 620 137 602L137 81C137 63 133 51 126 46C119 41 98 39 63 39L35 39L35 0C61 2 111 3 184 3C258 3 308 2 334 0L334 39L306 39C271 39 250 41 243 46C236 51 232 63 232 81L232 312M274 644L362 644C391 644 416 640 437 633C494 612 514 570 514 495C514 467 511 443 504 423C487 373 433 346 362 346L229 346L229 609C229 645 235 644 274 644Z"/><path id="MJX-6-NCM-N-53" d="M252 669C359 669 422 601 440 466C441 456 447 451 456 451C467 451 472 460 472 478L472 677C472 696 467 705 458 705C452 705 446 700 440 690L408 638C364 680 324 705 251 705C142 705 56 617 56 509C56 417 116 349 187 324L317 292C384 275 428 229 428 154C428 79 376 17 301 17C170 17 93 91 88 218C88 227 83 232 73 232C62 232 56 223 56 204L56 6C56-13 61-22 71-22C77-22 83-17 89-7L121 45C164 0 224-22 302-22C359-22 407-1 444 40C481 81 499 130 499 188C499 235 485 278 458 317C431 356 394 380 349 391L223 422C170 434 127 481 127 544C127 614 182 669 252 669Z"/><path id="MJX-6-NCM-N-3D" d="M698 367L80 367C64 367 56 359 56 344C56 329 64 321 80 321L698 321C714 321 722 329 722 344C722 356 711 367 698 367M698 179L80 179C64 179 56 171 56 156C56 141 64 133 80 133L698 133C714 133 722 141 722 156C722 169 711 179 698 179Z"/><path id="MJX-6-NCM-SO-2211" d="M56 713L417 216L67-217C60-225 57-231 57-235C57-245 67-250 88-250L913-250L1001 5L967 5C954-33 933-66 902-95C825-166 719-188 565-188L152-188L490 232C497 240 500 246 500 250C500 254 498 259 493 266L175 702L560 702C682 702 764 691 854 644C907 616 944 571 967 510L1001 510L913 750L88 750C57 750 56 746 56 713Z"/><path id="MJX-6-NCM-N-28" d="M318-248C327-248 332-243 332-234C332-231 330-227 327-223C275-183 233-117 202-26C175 53 161 131 161 208L161 292C161 369 175 447 202 526C233 617 275 683 327 723C330 726 332 730 332 734C332 743 327 748 318 748C317 748 314 747 311 745C251 699 201 631 160 540C121 453 101 371 101 292L101 208C101 129 121 47 160-40C201-131 251-199 311-245C314-247 317-248 318-248Z"/><path id="MJX-6-NCM-N-4B" d="M550 616C550 607 545 597 534 586L231 297L231 602C231 620 235 631 242 636C249 641 270 644 305 644L333 644L333 683C307 681 257 680 183 680C109 680 59 681 33 683L33 644L61 644C96 644 117 641 124 636C131 631 135 620 135 602L135 81C135 63 131 51 124 46C117 41 96 39 61 39L33 39L33 0C59 2 109 3 182 3C257 3 307 2 333 0L333 39L305 39C270 39 249 41 242 46C235 51 231 63 231 81L231 252L341 357L517 96C526 82 531 71 531 64C531 47 512 39 473 39L473 0C516 3 564 4 618 3L736 0L736 39C671 39 659 45 631 84L405 418L581 586C620 625 667 644 722 644L722 683C702 681 673 680 634 680C573 680 530 681 505 683L505 644C529 644 550 636 550 616Z"/><path id="MJX-6-NCM-N-D7" d="M630 32C630 39 628 44 623 49L422 250L623 451C628 456 630 461 630 468C630 481 620 491 607 491C600 491 595 489 590 484L389 283L188 484C183 489 178 491 171 491C158 491 148 481 148 468C148 461 150 456 155 451L356 250L155 49C150 44 148 39 148 32C148 19 158 9 171 9C178 9 183 11 188 16L389 217L590 16C595 11 600 9 607 9C620 9 630 19 630 32Z"/><path id="MJX-6-NCM-N-6F" d="M249-11C311-11 363 11 406 55C449 99 471 152 471 214C471 277 450 332 408 378C366 424 313 448 250 448C187 448 135 424 92 378C49 332 28 277 28 214C28 152 49 99 92 55C135 11 188-11 249-11M250 21C202 21 166 42 141 85C125 113 117 159 117 222C117 283 125 327 140 355C164 398 200 419 249 419C296 419 332 398 357 357C374 329 382 284 382 222C382 106 348 21 250 21Z"/><path id="MJX-6-NCM-N-69" d="M194 601C194 631 169 657 139 657C109 657 83 631 83 601C83 571 108 544 138 544C169 544 194 570 194 601M143 3L247 0L247 39C214 39 194 41 188 45C182 49 180 60 180 78L180 445L37 433L37 395C70 395 91 392 98 387C105 382 108 368 108 345L108 79C108 60 105 48 98 44C91 40 69 39 33 39L33 0Z"/><path id="MJX-6-NCM-N-6E" d="M314 413C359 413 382 378 382 307L382 79C382 60 379 48 372 44C365 40 343 38 306 38L306 0L421 3L535 0L535 38C503 38 482 39 472 42C462 45 458 52 458 64L458 251C458 298 457 331 454 350C444 411 399 442 320 442C257 442 210 412 179 352L179 442L32 431L32 393C68 393 90 390 98 384C106 378 109 365 109 342L109 79C109 60 105 48 98 44C91 40 69 38 32 38L32 0L147 3L261 0L261 38C224 38 203 40 196 44C189 48 185 60 185 79L185 259C185 340 236 413 314 413Z"/><path id="MJX-6-NCM-N-29" d="M78-245C138-199 188-131 229-40C268 47 288 129 288 208L288 292C288 371 268 453 229 540C188 631 138 699 78 745C75 747 72 748 71 748C62 748 57 743 57 734C57 730 59 726 62 723C114 683 156 617 187 526C214 447 228 369 228 292L228 208C228 131 214 53 187-26C156-117 114-183 62-223C59-227 57-231 57-234C57-243 62-248 71-248C72-248 75-247 78-245Z"/></defs><g stroke="#eeeeee" fill="#eeeeee" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math" data-latex="\text{IPS} = \frac{\sum (\text{SKS} \times \text{Poin})}{\sum \text{SKS}}"><g data-mml-node="mtext" data-latex="\text{IPS}"><use data-c="49" xlink:href="#MJX-6-NCM-N-49"/><use data-c="50" xlink:href="#MJX-6-NCM-N-50" transform="translate(361,0)"/><use data-c="53" xlink:href="#MJX-6-NCM-N-53" transform="translate(1042,0)"/></g><g data-mml-node="mo" data-latex="=" transform="translate(1875.8,0)"><use data-c="3D" xlink:href="#MJX-6-NCM-N-3D"/></g><g data-mml-node="mfrac" data-latex="\frac{\sum (\text{SKS} \times \text{Poin})}{\sum \text{SKS}}" transform="translate(2931.6,0)"><g data-mml-node="mrow" data-latex="\sum (\text{SKS} \times \text{Poin})" transform="translate(220,710)"><g data-mml-node="mo" data-latex="\sum"><use data-c="2211" xlink:href="#MJX-6-NCM-SO-2211"/></g><g data-mml-node="mo" data-latex="(" transform="translate(1056,0)"><use data-c="28" xlink:href="#MJX-6-NCM-N-28"/></g><g data-mml-node="mtext" data-latex="\text{SKS}" transform="translate(1445,0)"><use data-c="53" xlink:href="#MJX-6-NCM-N-53"/><use data-c="4B" xlink:href="#MJX-6-NCM-N-4B" transform="translate(556,0)"/><use data-c="53" xlink:href="#MJX-6-NCM-N-53" transform="translate(1334,0)"/></g><g data-mml-node="mo" data-latex="\times" transform="translate(3557.2,0)"><use data-c="D7" xlink:href="#MJX-6-NCM-N-D7"/></g><g data-mml-node="mtext" data-latex="\text{Poin}" transform="translate(4557.4,0)"><use data-c="50" xlink:href="#MJX-6-NCM-N-50"/><use data-c="6F" xlink:href="#MJX-6-NCM-N-6F" transform="translate(681,0)"/><use data-c="69" xlink:href="#MJX-6-NCM-N-69" transform="translate(1181,0)"/><use data-c="6E" xlink:href="#MJX-6-NCM-N-6E" transform="translate(1459,0)"/></g><g data-mml-node="mo" data-latex=")" transform="translate(6572.4,0)"><use data-c="29" xlink:href="#MJX-6-NCM-N-29"/></g></g><g data-mml-node="mrow" data-latex="\sum \text{SKS}" transform="translate(2144.4,-710)"><g data-mml-node="mo" data-latex="\sum"><use data-c="2211" xlink:href="#MJX-6-NCM-SO-2211"/></g><g data-mml-node="mtext" data-latex="\text{SKS}" transform="translate(1222.7,0)"><use data-c="53" xlink:href="#MJX-6-NCM-N-53"/><use data-c="4B" xlink:href="#MJX-6-NCM-N-4B" transform="translate(556,0)"/><use data-c="53" xlink:href="#MJX-6-NCM-N-53" transform="translate(1334,0)"/></g></g><rect width="7161.4" height="60" x="120" y="220"/></g></g></g></g></svg>


## Format hasil pemindaian
Fungsi pemindaian mengembalikan array JSON berisi objek dengan properti:
- `code` (string) — kode mata kuliah
- `name` (string) — nama mata kuliah
- `sks` (number) — jumlah SKS
- `grade` (string) — nilai huruf (A, AB, B, BC, C, D, E)

Contoh: hasil dari [`scanTranscriptImage`](geminiService.ts) ([geminiService.ts](geminiService.ts)) diharapkan berupa array objek sesuai schema JSON yang dipakai di service.

## Setup & Menjalankan
1. Install dependensi:
```sh
npm install
```
2. Buat file `.env.local` untuk menyimpan kunci API Gemini:
```
GEMINI_API_KEY=your_api_key_here
```
> Vite meng-inject key via [vite.config.ts](vite.config.ts) ke `process.env.API_KEY` / `process.env.GEMINI_API_KEY`.

3. Jalankan mode development:
```sh
npm run dev
```
Buka aplikasi di http://localhost:3000

## Catatan API & Privasi
- Fitur scan membutuhkan kunci API Google GenAI. Pastikan akun & billing sudah diatur.
- Aplikasi meminta izin kamera jika menggunakan fitur pemindaian langsung (lihat [metadata.json](metadata.json) yang meminta permission `camera`).

## File penting
- [App.tsx](App.tsx) — UI utama dan logika interaksi
- [geminiService.ts](geminiService.ts) — integrasi AI / ekstraksi gambar
- [constants.ts](constants.ts), [types.ts](types.ts) — skala nilai dan tipe data
- [vite.config.ts](vite.config.ts), [package.json](package.json) — konfigurasi & script
