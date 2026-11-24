DROP TABLE IF EXISTS cuerpo_tecnico, jugador, personal_seleccion, estadio, ciudad_sede,
    seleccion, ronda, grupo, pais, confederacion CASCADE;
DROP TYPE IF EXISTS posicion_jugador, cargo_cuerpo_tecnico;

CREATE TYPE posicion_jugador AS ENUM ('arquero', 'defensor', 'mediocampista', 'delantero');
CREATE TYPE cargo_cuerpo_tecnico AS ENUM ('director_tecnico', 'auxiliar_tecnico', 'preparador_fisico', 'entrenador_porteros');

CREATE TABLE confederacion (
    confederacion_id  serial,
    siglas            varchar(10)  NOT NULL,
    nombre            varchar(100) NOT NULL
);

CREATE TABLE pais (
    pais_id     serial,
    codigo      char(3)      NOT NULL,
    nombre      varchar(100) NOT NULL
);

CREATE TABLE grupo (
    grupo_id  serial,
    nombre    char(1) NOT NULL
);

CREATE TABLE ronda (
    ronda_id         serial,
    nombre           varchar(50) NOT NULL,
    orden            smallint    NOT NULL,
    es_eliminatoria  boolean     NOT NULL
);

CREATE TABLE seleccion (
    seleccion_id      serial,
    nombre            varchar(100) NOT NULL,
    codigo            char(3)      NOT NULL,
    confederacion_id  integer      NOT NULL,
    grupo_id          integer      NOT NULL
);

CREATE TABLE ciudad_sede (
    ciudad_sede_id  serial,
    nombre          varchar(100) NOT NULL,
    pais_id         integer      NOT NULL
);

CREATE TABLE estadio (
    estadio_id      serial,
    nombre          varchar(100) NOT NULL,
    nombre_fifa     varchar(100) NOT NULL,
    capacidad       integer      NOT NULL,
    capacidad_fifa  integer      NOT NULL,
    direccion       varchar(200) NOT NULL,
    municipio       varchar(100) NOT NULL,
    estado          varchar(100) NOT NULL,
    codigo_postal   varchar(10)  NOT NULL,
    ciudad_sede_id  integer      NOT NULL
);

CREATE TABLE personal_seleccion (
    personal_seleccion_id  serial,
    nombre                 varchar(100) NOT NULL,
    apellido               varchar(100),
    fecha_nacimiento       date         NOT NULL,
    seleccion_id           integer      NOT NULL
);

CREATE TABLE jugador (
    personal_seleccion_id  integer          NOT NULL,
    posicion               posicion_jugador NOT NULL,
    dorsal                 smallint         NOT NULL
);

CREATE TABLE cuerpo_tecnico (
    personal_seleccion_id  integer              NOT NULL,
    pais_id                integer              NOT NULL,
    cargo                  cargo_cuerpo_tecnico NOT NULL
);

ALTER TABLE confederacion      ADD CONSTRAINT pk_confederacion      PRIMARY KEY (confederacion_id);
ALTER TABLE pais               ADD CONSTRAINT pk_pais               PRIMARY KEY (pais_id);
ALTER TABLE grupo              ADD CONSTRAINT pk_grupo              PRIMARY KEY (grupo_id);
ALTER TABLE ronda              ADD CONSTRAINT pk_ronda              PRIMARY KEY (ronda_id);
ALTER TABLE seleccion          ADD CONSTRAINT pk_seleccion          PRIMARY KEY (seleccion_id);
ALTER TABLE ciudad_sede        ADD CONSTRAINT pk_ciudad_sede        PRIMARY KEY (ciudad_sede_id);
ALTER TABLE estadio            ADD CONSTRAINT pk_estadio            PRIMARY KEY (estadio_id);
ALTER TABLE personal_seleccion ADD CONSTRAINT pk_personal_seleccion PRIMARY KEY (personal_seleccion_id);
ALTER TABLE jugador            ADD CONSTRAINT pk_jugador            PRIMARY KEY (personal_seleccion_id);
ALTER TABLE cuerpo_tecnico     ADD CONSTRAINT pk_cuerpo_tecnico     PRIMARY KEY (personal_seleccion_id);

ALTER TABLE confederacion ADD CONSTRAINT uq_confederacion_siglas UNIQUE (siglas);
ALTER TABLE pais          ADD CONSTRAINT uq_pais_codigo          UNIQUE (codigo);
ALTER TABLE grupo         ADD CONSTRAINT uq_grupo_nombre         UNIQUE (nombre);
ALTER TABLE ronda         ADD CONSTRAINT uq_ronda_nombre         UNIQUE (nombre);
ALTER TABLE ronda         ADD CONSTRAINT uq_ronda_orden          UNIQUE (orden);
ALTER TABLE seleccion     ADD CONSTRAINT uq_seleccion_codigo     UNIQUE (codigo);
ALTER TABLE seleccion     ADD CONSTRAINT uq_seleccion_nombre     UNIQUE (nombre);
ALTER TABLE ciudad_sede   ADD CONSTRAINT uq_ciudad_sede_nombre   UNIQUE (nombre);
ALTER TABLE estadio       ADD CONSTRAINT uq_estadio_nombre       UNIQUE (nombre);
ALTER TABLE estadio       ADD CONSTRAINT uq_estadio_nombre_fifa  UNIQUE (nombre_fifa);

ALTER TABLE seleccion ADD CONSTRAINT fk_seleccion_confederacion
    FOREIGN KEY (confederacion_id) REFERENCES confederacion (confederacion_id);
ALTER TABLE seleccion ADD CONSTRAINT fk_seleccion_grupo
    FOREIGN KEY (grupo_id) REFERENCES grupo (grupo_id);
ALTER TABLE ciudad_sede ADD CONSTRAINT fk_ciudad_sede_pais
    FOREIGN KEY (pais_id) REFERENCES pais (pais_id);
ALTER TABLE estadio ADD CONSTRAINT fk_estadio_ciudad_sede
    FOREIGN KEY (ciudad_sede_id) REFERENCES ciudad_sede (ciudad_sede_id);
ALTER TABLE personal_seleccion ADD CONSTRAINT fk_personal_seleccion_seleccion
    FOREIGN KEY (seleccion_id) REFERENCES seleccion (seleccion_id);
ALTER TABLE jugador ADD CONSTRAINT fk_jugador_personal_seleccion
    FOREIGN KEY (personal_seleccion_id) REFERENCES personal_seleccion (personal_seleccion_id) ON DELETE CASCADE;
ALTER TABLE cuerpo_tecnico ADD CONSTRAINT fk_cuerpo_tecnico_personal_seleccion
    FOREIGN KEY (personal_seleccion_id) REFERENCES personal_seleccion (personal_seleccion_id) ON DELETE CASCADE;
ALTER TABLE cuerpo_tecnico ADD CONSTRAINT fk_cuerpo_tecnico_pais
    FOREIGN KEY (pais_id) REFERENCES pais (pais_id);

ALTER TABLE pais        ADD CONSTRAINT ck_pais_codigo            CHECK (codigo ~ '^[A-Z]{3}$');
ALTER TABLE grupo       ADD CONSTRAINT ck_grupo_nombre           CHECK (nombre BETWEEN 'A' AND 'L');
ALTER TABLE ronda       ADD CONSTRAINT ck_ronda_orden            CHECK (orden > 0);
ALTER TABLE seleccion   ADD CONSTRAINT ck_seleccion_codigo       CHECK (codigo ~ '^[A-Z]{3}$');
ALTER TABLE estadio     ADD CONSTRAINT ck_estadio_capacidad      CHECK (capacidad > 0);
ALTER TABLE estadio     ADD CONSTRAINT ck_estadio_capacidad_fifa CHECK (capacidad_fifa > 0);
ALTER TABLE personal_seleccion ADD CONSTRAINT ck_personal_fecha_nacimiento
    CHECK (fecha_nacimiento BETWEEN DATE '1940-01-01' AND DATE '2012-12-31');
ALTER TABLE jugador     ADD CONSTRAINT ck_jugador_dorsal         CHECK (dorsal BETWEEN 1 AND 26);
