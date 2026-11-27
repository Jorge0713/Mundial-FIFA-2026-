DROP TABLE IF EXISTS cronologia, partido, partido_venta, cuerpo_tecnico, jugador, personal_seleccion, estadio, ciudad_sede,
    seleccion, ronda, grupo, pais,
    nivel_amenidad, nivel_version,
    nivel, amenidad, paquete, categoria, fase_venta, evento, rol CASCADE;
DROP TYPE IF EXISTS posicion_jugador, cargo_cuerpo_tecnico, version_nivel, periodo_partido;

CREATE TYPE posicion_jugador AS ENUM ('arquero', 'defensor', 'mediocampista', 'delantero');
CREATE TYPE cargo_cuerpo_tecnico AS ENUM ('director_tecnico', 'auxiliar_tecnico', 'entrenador_porteros', 'preparador_fisico',
    'fisioterapeuta', 'masajista', 'jefe_de_equipo', 'otro');
CREATE TYPE version_nivel AS ENUM ('estandar', 'plus');
CREATE TYPE periodo_partido AS ENUM ('antes_del_partido', 'primer_tiempo', 'descanso', 'segundo_tiempo',
    'antes_de_prorroga', 'prorroga_primer_tiempo', 'descanso_prorroga', 'prorroga_segundo_tiempo',
    'antes_de_penales', 'tanda_penales', 'fin_del_partido');

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
    seleccion_id  serial,
    nombre        varchar(100) NOT NULL,
    codigo        char(3)      NOT NULL,
    grupo_id      integer      NOT NULL
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

CREATE TABLE nivel (
    nivel_id     serial,
    nombre       varchar(50)  NOT NULL,
    descripcion  varchar(300) NOT NULL
);

CREATE TABLE amenidad (
    amenidad_id  serial,
    nombre       varchar(100) NOT NULL
);

CREATE TABLE nivel_amenidad (
    nivel_id     integer NOT NULL,
    amenidad_id  integer NOT NULL
);

CREATE TABLE nivel_version (
    nivel_id  integer       NOT NULL,
    version   version_nivel NOT NULL
);

CREATE TABLE paquete (
    paquete_id   serial,
    nombre       varchar(50)  NOT NULL,
    descripcion  varchar(300) NOT NULL
);

CREATE TABLE categoria (
    categoria_id  serial,
    nombre        varchar(50)  NOT NULL,
    descripcion   varchar(300) NOT NULL
);

CREATE TABLE fase_venta (
    fase_venta_id  serial,
    nombre         varchar(100) NOT NULL,
    fecha_inicio   date         NOT NULL,
    fecha_fin      date         NOT NULL
);

CREATE TABLE evento (
    evento_id  serial,
    nombre     varchar(50) NOT NULL
);

CREATE TABLE rol (
    rol_id  serial,
    nombre  varchar(50) NOT NULL
);

CREATE TABLE partido_venta (
    partido_venta_id  serial,
    fecha             date    NOT NULL,
    estadio_id        integer NOT NULL,
    ronda_id          integer NOT NULL
);

CREATE TABLE partido (
    partido_id           serial,
    partido_venta_id     integer     NOT NULL,
    hora_inicio          time        NOT NULL,
    hora_termino         time,
    asistencia           integer,
    local_id             integer,
    visitante_id         integer,
    plantilla_local      varchar(10),
    plantilla_visitante  varchar(10),
    posesion_local       numeric(5,2),
    posesion_visitante   numeric(5,2)
);

CREATE TABLE cronologia (
    cronologia_id    serial,
    partido_id       integer         NOT NULL,
    evento_id        integer         NOT NULL,
    periodo          periodo_partido NOT NULL,
    minuto           smallint,
    tiempo_agregado  smallint,
    entra_id         integer,
    sale_id          integer
);

ALTER TABLE pais               ADD CONSTRAINT pk_pais               PRIMARY KEY (pais_id);
ALTER TABLE grupo              ADD CONSTRAINT pk_grupo              PRIMARY KEY (grupo_id);
ALTER TABLE ronda              ADD CONSTRAINT pk_ronda              PRIMARY KEY (ronda_id);
ALTER TABLE seleccion          ADD CONSTRAINT pk_seleccion          PRIMARY KEY (seleccion_id);
ALTER TABLE ciudad_sede        ADD CONSTRAINT pk_ciudad_sede        PRIMARY KEY (ciudad_sede_id);
ALTER TABLE estadio            ADD CONSTRAINT pk_estadio            PRIMARY KEY (estadio_id);
ALTER TABLE personal_seleccion ADD CONSTRAINT pk_personal_seleccion PRIMARY KEY (personal_seleccion_id);
ALTER TABLE jugador            ADD CONSTRAINT pk_jugador            PRIMARY KEY (personal_seleccion_id);
ALTER TABLE cuerpo_tecnico     ADD CONSTRAINT pk_cuerpo_tecnico     PRIMARY KEY (personal_seleccion_id);
ALTER TABLE nivel              ADD CONSTRAINT pk_nivel              PRIMARY KEY (nivel_id);
ALTER TABLE amenidad           ADD CONSTRAINT pk_amenidad           PRIMARY KEY (amenidad_id);
ALTER TABLE nivel_amenidad     ADD CONSTRAINT pk_nivel_amenidad     PRIMARY KEY (nivel_id, amenidad_id);
ALTER TABLE nivel_version      ADD CONSTRAINT pk_nivel_version      PRIMARY KEY (nivel_id, version);
ALTER TABLE paquete            ADD CONSTRAINT pk_paquete            PRIMARY KEY (paquete_id);
ALTER TABLE categoria          ADD CONSTRAINT pk_categoria          PRIMARY KEY (categoria_id);
ALTER TABLE fase_venta         ADD CONSTRAINT pk_fase_venta         PRIMARY KEY (fase_venta_id);
ALTER TABLE evento             ADD CONSTRAINT pk_evento             PRIMARY KEY (evento_id);
ALTER TABLE rol                ADD CONSTRAINT pk_rol                PRIMARY KEY (rol_id);
ALTER TABLE partido_venta      ADD CONSTRAINT pk_partido_venta      PRIMARY KEY (partido_venta_id);
ALTER TABLE partido            ADD CONSTRAINT pk_partido            PRIMARY KEY (partido_id);
ALTER TABLE cronologia         ADD CONSTRAINT pk_cronologia         PRIMARY KEY (cronologia_id);

ALTER TABLE pais          ADD CONSTRAINT uq_pais_codigo          UNIQUE (codigo);
ALTER TABLE grupo         ADD CONSTRAINT uq_grupo_nombre         UNIQUE (nombre);
ALTER TABLE ronda         ADD CONSTRAINT uq_ronda_nombre         UNIQUE (nombre);
ALTER TABLE ronda         ADD CONSTRAINT uq_ronda_orden          UNIQUE (orden);
ALTER TABLE seleccion     ADD CONSTRAINT uq_seleccion_codigo     UNIQUE (codigo);
ALTER TABLE seleccion     ADD CONSTRAINT uq_seleccion_nombre     UNIQUE (nombre);
ALTER TABLE ciudad_sede   ADD CONSTRAINT uq_ciudad_sede_nombre   UNIQUE (nombre);
ALTER TABLE estadio       ADD CONSTRAINT uq_estadio_nombre       UNIQUE (nombre);
ALTER TABLE estadio       ADD CONSTRAINT uq_estadio_nombre_fifa  UNIQUE (nombre_fifa);
ALTER TABLE nivel         ADD CONSTRAINT uq_nivel_nombre         UNIQUE (nombre);
ALTER TABLE amenidad      ADD CONSTRAINT uq_amenidad_nombre      UNIQUE (nombre);
ALTER TABLE paquete       ADD CONSTRAINT uq_paquete_nombre       UNIQUE (nombre);
ALTER TABLE categoria     ADD CONSTRAINT uq_categoria_nombre     UNIQUE (nombre);
ALTER TABLE fase_venta    ADD CONSTRAINT uq_fase_venta_nombre    UNIQUE (nombre);
ALTER TABLE evento        ADD CONSTRAINT uq_evento_nombre        UNIQUE (nombre);
ALTER TABLE rol           ADD CONSTRAINT uq_rol_nombre           UNIQUE (nombre);
ALTER TABLE partido_venta ADD CONSTRAINT uq_partido_venta_estadio_fecha UNIQUE (estadio_id, fecha);
ALTER TABLE partido       ADD CONSTRAINT uq_partido_partido_venta UNIQUE (partido_venta_id);

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
ALTER TABLE nivel_amenidad ADD CONSTRAINT fk_nivel_amenidad_nivel
    FOREIGN KEY (nivel_id) REFERENCES nivel (nivel_id);
ALTER TABLE nivel_amenidad ADD CONSTRAINT fk_nivel_amenidad_amenidad
    FOREIGN KEY (amenidad_id) REFERENCES amenidad (amenidad_id);
ALTER TABLE nivel_version ADD CONSTRAINT fk_nivel_version_nivel
    FOREIGN KEY (nivel_id) REFERENCES nivel (nivel_id);
ALTER TABLE partido ADD CONSTRAINT fk_partido_local
    FOREIGN KEY (local_id) REFERENCES seleccion (seleccion_id);
ALTER TABLE partido ADD CONSTRAINT fk_partido_visitante
    FOREIGN KEY (visitante_id) REFERENCES seleccion (seleccion_id);
ALTER TABLE partido_venta ADD CONSTRAINT fk_partido_venta_estadio
    FOREIGN KEY (estadio_id) REFERENCES estadio (estadio_id);
ALTER TABLE partido_venta ADD CONSTRAINT fk_partido_venta_ronda
    FOREIGN KEY (ronda_id) REFERENCES ronda (ronda_id);
ALTER TABLE partido ADD CONSTRAINT fk_partido_partido_venta
    FOREIGN KEY (partido_venta_id) REFERENCES partido_venta (partido_venta_id);
ALTER TABLE cronologia ADD CONSTRAINT fk_cronologia_partido
    FOREIGN KEY (partido_id) REFERENCES partido (partido_id);
ALTER TABLE cronologia ADD CONSTRAINT fk_cronologia_evento
    FOREIGN KEY (evento_id) REFERENCES evento (evento_id);
ALTER TABLE cronologia ADD CONSTRAINT fk_cronologia_entra
    FOREIGN KEY (entra_id) REFERENCES personal_seleccion (personal_seleccion_id);
ALTER TABLE cronologia ADD CONSTRAINT fk_cronologia_sale
    FOREIGN KEY (sale_id) REFERENCES personal_seleccion (personal_seleccion_id);

ALTER TABLE pais        ADD CONSTRAINT ck_pais_codigo            CHECK (codigo ~ '^[A-Z]{3}$');
ALTER TABLE grupo       ADD CONSTRAINT ck_grupo_nombre           CHECK (nombre BETWEEN 'A' AND 'L');
ALTER TABLE ronda       ADD CONSTRAINT ck_ronda_orden            CHECK (orden > 0);
ALTER TABLE seleccion   ADD CONSTRAINT ck_seleccion_codigo       CHECK (codigo ~ '^[A-Z]{3}$');
ALTER TABLE estadio     ADD CONSTRAINT ck_estadio_capacidad      CHECK (capacidad > 0);
ALTER TABLE estadio     ADD CONSTRAINT ck_estadio_capacidad_fifa CHECK (capacidad_fifa > 0);
ALTER TABLE personal_seleccion ADD CONSTRAINT ck_personal_fecha_nacimiento
    CHECK (fecha_nacimiento BETWEEN DATE '1940-01-01' AND DATE '2012-12-31');
ALTER TABLE jugador     ADD CONSTRAINT ck_jugador_dorsal         CHECK (dorsal BETWEEN 1 AND 26);
ALTER TABLE fase_venta  ADD CONSTRAINT ck_fase_venta_fechas      CHECK (fecha_fin >= fecha_inicio);
ALTER TABLE partido     ADD CONSTRAINT ck_partido_asistencia     CHECK (asistencia > 0);
ALTER TABLE partido     ADD CONSTRAINT ck_partido_selecciones    CHECK (local_id <> visitante_id);
ALTER TABLE partido     ADD CONSTRAINT ck_partido_posesion
    CHECK (posesion_local BETWEEN 0 AND 100 AND posesion_visitante BETWEEN 0 AND 100
        AND posesion_local + posesion_visitante <= 100);
ALTER TABLE cronologia  ADD CONSTRAINT ck_cronologia_minuto      CHECK (minuto BETWEEN 0 AND 150);
ALTER TABLE cronologia  ADD CONSTRAINT ck_cronologia_tiempo_agregado CHECK (tiempo_agregado > 0);
ALTER TABLE cronologia  ADD CONSTRAINT ck_cronologia_personas
    CHECK (sale_id IS NULL OR (entra_id IS NOT NULL AND entra_id <> sale_id));
ALTER TABLE partido     ADD CONSTRAINT ck_partido_plantilla_local
    CHECK (plantilla_local ~ '^[1-9](-[1-9]){2,4}$');
ALTER TABLE partido     ADD CONSTRAINT ck_partido_plantilla_visitante
    CHECK (plantilla_visitante ~ '^[1-9](-[1-9]){2,4}$');
